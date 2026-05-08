/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.iti.servlet;

import com.iti.dao.ProfileDao;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.*;

/**
 *
 * @author mahmoud
 */

@WebServlet("/profiles/*")
public class ProfileServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        String uri = req.getRequestURI();

        if (uri.endsWith("/rateplans")) {
            int limit = 10;
            int offset = 0;
            String sortBy = "rateplan_id";
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

            res.getWriter().print(ProfileDao.getRateplansAsJson(limit, offset, sortBy, sortOrder));
        } else if (uri.endsWith("/fees")) {
            int limit = 10;
            int offset = 0;
            String sortBy = "name";
            String sortOrder = "ASC";
            String filter = "all";

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
            if (req.getParameter("filter") != null)
                filter = req.getParameter("filter");

            res.getWriter().print(ProfileDao.getAllFeesAsJson(limit, offset, sortBy, sortOrder, filter));
        } else if (uri.endsWith("/services")) {
            res.getWriter().print(ProfileDao.getServicesAsJson());
        } else if (uri.endsWith("/rateplan-services")) {
            int rateplanId = Integer.parseInt(req.getParameter("rateplan_id"));
            res.getWriter().print(ProfileDao.getRateplanServicesAsJson(rateplanId));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {

        String uri = req.getRequestURI();

        if (uri.endsWith("/rateplans")) {
            try {
                String name = req.getParameter("name");
                double ror = Double.parseDouble(req.getParameter("ror"));
                String desc = req.getParameter("description");
                double price = Double.parseDouble(req.getParameter("plan_price"));
                long freeUnits = Long.parseLong(req.getParameter("free_units"));

                ProfileDao.addRateplan(name, ror, desc, price, freeUnits);
                res.getWriter().print("Rateplan '" + name + "' created successfully!");
            } catch (Exception e) {
                res.setStatus(500);
                res.getWriter().print("Database Error: Could not create rateplan.");
                e.printStackTrace();
            }
            return;
        }

        if (uri.endsWith("/rateplan-services")) {
            try {
                int rateplanId = Integer.parseInt(req.getParameter("rateplan_id"));
                int serviceId = Integer.parseInt(req.getParameter("service_id"));

                ProfileDao.linkServiceToRateplan(rateplanId, serviceId);
                res.getWriter().print("Service package successfully linked to Rateplan!");
            } catch (Exception e) {
                res.setStatus(500);
                res.getWriter().print("Database Error: Could not link service.");
                e.printStackTrace();
            }
            return;
        }

        if (uri.endsWith("/recurring")) {
            try {
                String name = req.getParameter("name");
                String desc = req.getParameter("description");
                double amount = Double.parseDouble(req.getParameter("amount"));
                ProfileDao.addRecurringService(name, desc, amount);
                res.getWriter().print("Recurring Service created successfully!");
            } catch (Exception e) {
                res.setStatus(500);
                res.getWriter().print("Database Error: Could not create Recurring Service.");
                e.printStackTrace();
            }
            return;
        }

        if (uri.endsWith("/onetime")) {
            try {
                String name = req.getParameter("name");
                String desc = req.getParameter("description");
                double amount = Double.parseDouble(req.getParameter("amount"));
                ProfileDao.addOneTimeFee(name, desc, amount);
                res.getWriter().print("One-Time Fee created successfully!");
            } catch (Exception e) {
                res.setStatus(500);
                res.getWriter().print("Database Error: Could not create One-Time Fee.");
                e.printStackTrace();
            }
            return;
        }

        if (uri.endsWith("/services")) {
            try {
                int type = Integer.parseInt(req.getParameter("service_type"));
                String desc = req.getParameter("description");
                double price = Double.parseDouble(req.getParameter("rating_price"));
                long units = Long.parseLong(req.getParameter("units"));
                int zoneId = Integer.parseInt(req.getParameter("zone_id"));

                ProfileDao.addServicePackage(type, desc, price, units, zoneId);
                res.getWriter().print("Service Package created successfully!");
            } catch (Exception e) {
                res.setStatus(500);
                res.getWriter().print("Database Error: Could not create service package.");
                e.printStackTrace();
            }
            return;
        }

        String msisdn = req.getParameter("msisdn");
        int feeId = Integer.parseInt(req.getParameter("feeId"));
        String feeType = req.getParameter("feeType");

        try {
            if ("RECURRING".equals(feeType)) {
                ProfileDao.assignRecurringService(msisdn, feeId);
                res.getWriter().print("Recurring Service assigned successfully!");
            } else if ("ONE_TIME".equals(feeType)) {
                ProfileDao.assignOneTimeFee(msisdn, feeId);
                res.getWriter().print("One-Time Fee assigned successfully!");
            } else {
                res.setStatus(400);
                res.getWriter().print("Invalid Fee Type.");
            }
        } catch (Exception e) {
            res.setStatus(500);
            res.getWriter().print("Error: Could not assign fee. Verify the MSISDN exists.");
            e.printStackTrace();
        }
    }
}