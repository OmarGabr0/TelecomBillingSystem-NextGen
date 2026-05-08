/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.iti.servlet;

import com.iti.model.Customer;
import com.iti.service.CustomerService;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

import java.io.*;
import java.util.List;

/**
 *
 * @author mahmoud
 */

@WebServlet("/customer/*")
public class CustomerServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8"); // Ensure Arabic/Special characters work

        String uri = req.getRequestURI();

        if (uri != null && uri.endsWith("/invoices")) {
            String email = req.getParameter("email");
            if (!isSelfOrAdmin(req, email)) {
                res.setStatus(403);
                res.getWriter().print("Forbidden");
                return;
            }

            int limit = 10;
            int offset = 0;
            String sortBy = "id";
            String sortOrder = "DESC";

            try {
                if (req.getParameter("limit") != null)
                    limit = Integer.parseInt(req.getParameter("limit"));
            } catch (Exception e) {
            }
            try {
                if (req.getParameter("offset") != null)
                    offset = Integer.parseInt(req.getParameter("offset"));
            } catch (Exception e) {
            }
            if (req.getParameter("sortBy") != null)
                sortBy = req.getParameter("sortBy");
            if (req.getParameter("sortOrder") != null)
                sortOrder = req.getParameter("sortOrder");

            String invoiceJson = com.iti.dao.InvoiceDao.getInvoicesAsJson(email, limit, offset, sortBy, sortOrder);
            res.getWriter().print(invoiceJson);
            return;
        }

        if (uri != null && uri.endsWith("/profile")) {
            String email = req.getParameter("email");
            if (!isSelfOrAdmin(req, email)) {
                res.setStatus(403);
                res.getWriter().print("Forbidden");
                return;
            }
            String profileJson = com.iti.dao.ProfileDao.getCustomerProfilesAsJson(email);
            res.getWriter().print(profileJson);
            return;
        }

        if (!isAdmin(req)) {
            res.setStatus(403);
            res.getWriter().print("Forbidden");
            return;
        }

        int limit = 10;
        int offset = 0;
        String sortBy = "name";
        String sortOrder = "ASC";

        try {
            if (req.getParameter("limit") != null)
                limit = Integer.parseInt(req.getParameter("limit"));
        } catch (Exception e) {
        }
        try {
            if (req.getParameter("offset") != null)
                offset = Integer.parseInt(req.getParameter("offset"));
        } catch (Exception e) {
        }
        if (req.getParameter("sortBy") != null)
            sortBy = req.getParameter("sortBy");
        if (req.getParameter("sortOrder") != null)
            sortOrder = req.getParameter("sortOrder");

        String searchQuery = req.getParameter("searchQuery");

        List<Customer> list = CustomerService.getCustomers(limit, offset, sortBy, sortOrder, searchQuery);

        StringBuilder json = new StringBuilder("[");

        for (Customer c : list) {
            String createdAtStr = (c.getCreated_at() != null) ? c.getCreated_at().toString() : "N/A";

            json.append(String.format(
                    "{\"name\":\"%s\",\"email\":\"%s\",\"address\":\"%s\",\"created_at\":\"%s\"},",
                    c.getName(), c.getEmail(), c.getAddress(), createdAtStr));
        }
        if (json.length() > 1) {
            json.setLength(json.length() - 1);
        }
        json.append("]");

        res.getWriter().print(json.toString());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        if (!isAdmin(req)) {
            res.setStatus(403);
            res.getWriter().print("Forbidden");
            return;
        }
        String body = req.getReader().lines().reduce("", String::concat);

        Customer c = new Customer();
        c.setName(extract(body, "name"));
        c.setEmail(extract(body, "email"));
        c.setAddress(extract(body, "address"));

        if (c.getEmail() == null || c.getEmail().isEmpty()) {
            res.setStatus(400); // Bad Request
            res.getWriter().print("Error: Email is required but was missing or JSON failed to parse.");
            return;
        }

        try {
            CustomerService.addCustomer(c);
            res.getWriter().print("Customer added successfully!");
        } catch (Exception e) {
            res.setStatus(500); // Internal Server Error
            res.getWriter().print("Database Error: Failed to add customer. Check Tomcat console.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        if (!isAdmin(req)) {
            res.setStatus(403);
            res.getWriter().print("Forbidden");
            return;
        }
        String body = req.getReader().lines().reduce("", String::concat);

        Customer c = new Customer();
        c.setEmail(extract(body, "email"));
        c.setName(extract(body, "name"));

        CustomerService.updateCustomer(c);

        res.getWriter().print("Updated");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        if (!isAdmin(req)) {
            res.setStatus(403);
            res.getWriter().print("Forbidden");
            return;
        }

        String email = req.getParameter("email");

        if (email != null && !email.isEmpty()) {
            CustomerService.deleteCustomer(email);
            res.getWriter().print("Deleted");
        } else {
            res.setStatus(400);
            res.getWriter().print("Email parameter missing");
        }
    }

    private boolean isAdmin(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null)
            return false;

        Object userObj = session.getAttribute("user");
        if (userObj == null)
            return false;

        return ((com.iti.model.User) userObj).getRole().equalsIgnoreCase("admin");
    }

    private boolean isSelfOrAdmin(HttpServletRequest req, String requestedEmail) {
        HttpSession session = req.getSession(false);
        if (session == null)
            return false;

        Object userObj = session.getAttribute("user");
        if (userObj == null)
            return false;

        com.iti.model.User user = (com.iti.model.User) userObj;
        if (user.getRole().equalsIgnoreCase("admin"))
            return true;
        if (user.getUsername().equalsIgnoreCase(requestedEmail))
            return true;

        return false;
    }

    private String extract(String json, String key) {
        try {
            String searchKey = "\"" + key + "\"";
            int keyIndex = json.indexOf(searchKey);
            if (keyIndex == -1)
                return "";

            int colonIndex = json.indexOf(":", keyIndex);
            int quote1 = json.indexOf("\"", colonIndex);
            int quote2 = json.indexOf("\"", quote1 + 1);

            return json.substring(quote1 + 1, quote2);
        } catch (Exception e) {
            return "";
        }
    }
}