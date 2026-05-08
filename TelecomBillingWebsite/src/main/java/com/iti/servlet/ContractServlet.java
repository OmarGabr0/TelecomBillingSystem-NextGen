package com.iti.servlet;

import com.iti.dao.ContractDao;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/contract")
public class ContractServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        String email = req.getParameter("email");
        if (email == null || email.trim().isEmpty()) {
            res.setStatus(400);
            res.getWriter().print("{\"error\":\"Email is required\"}");
            return;
        }

        if (!isSelfOrAdmin(req, email)) {
            res.setStatus(403);
            res.getWriter().print("{\"error\":\"Forbidden\"}");
            return;
        }

        String json = ContractDao.getContractsAsJson(email);
        res.getWriter().print(json);
    }

    private static final java.util.regex.Pattern MSISDN_PATTERN = java.util.regex.Pattern.compile("^002016\\d{8}$");

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!isAdmin(req)) {
            res.setStatus(403);
            res.getWriter().print("Forbidden");
            return;
        }

        String body = req.getReader().lines().reduce("", String::concat);

        String email = extract(body, "email");
        String msisdn = extract(body, "msisdn");
        String rateplanIdStr = extract(body, "rateplan_id");
        String creditLimitStr = extract(body, "credit_limit");

        if (email.isEmpty() || msisdn.isEmpty() || rateplanIdStr.isEmpty() || creditLimitStr.isEmpty()) {
            res.setStatus(400);
            res.getWriter().print("Missing required fields");
            return;
        }

        if (!MSISDN_PATTERN.matcher(msisdn).matches()) {
            res.setStatus(400);
            res.getWriter().print("Invalid MSISDN format. Expected: 002016XXXXXXXX (14 digits)");
            return;
        }

        try {
            int rateplanId = Integer.parseInt(rateplanIdStr);
            int creditLimit = Integer.parseInt(creditLimitStr);

            boolean success = ContractDao.addContract(email, msisdn, rateplanId, creditLimit, 0.0);
            if (success) {
                res.getWriter().print("Contract created successfully");
            } else {
                res.setStatus(500);
                res.getWriter().print("Failed to create contract");
            }
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            res.getWriter().print("Server Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!isAdmin(req)) {
            res.setStatus(403);
            res.getWriter().print("Forbidden");
            return;
        }

        String body = req.getReader().lines().reduce("", String::concat);

        String msisdn = extract(body, "msisdn");
        String rateplanIdStr = extract(body, "rateplan_id");
        String creditLimitStr = extract(body, "credit_limit");

        if (msisdn.isEmpty() || rateplanIdStr.isEmpty() || creditLimitStr.isEmpty()) {
            res.setStatus(400);
            res.getWriter().print("Missing required fields");
            return;
        }

        try {
            int rateplanId = Integer.parseInt(rateplanIdStr);
            int creditLimit = Integer.parseInt(creditLimitStr);

            boolean success = ContractDao.updateContract(msisdn, rateplanId, creditLimit);
            if (success) {
                res.getWriter().print("Contract updated successfully");
            } else {
                res.setStatus(500);
                res.getWriter().print("Failed to update contract");
            }
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            res.getWriter().print("Server Error: " + e.getMessage());
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
        return user.getUsername().equalsIgnoreCase(requestedEmail);
    }

    private String extract(String json, String key) {
        try {
            String searchKey = "\"" + key + "\"";
            int keyIndex = json.indexOf(searchKey);
            if (keyIndex == -1)
                return "";

            int colonIndex = json.indexOf(":", keyIndex);
            boolean isString = false;
            int startIdx = colonIndex + 1;

            while (startIdx < json.length() && Character.isWhitespace(json.charAt(startIdx))) {
                startIdx++;
            }

            if (json.charAt(startIdx) == '"') {
                isString = true;
                startIdx++;
            }

            int endIdx = startIdx;
            if (isString) {
                endIdx = json.indexOf("\"", startIdx);
            } else {
                while (endIdx < json.length() && json.charAt(endIdx) != ',' && json.charAt(endIdx) != '}') {
                    endIdx++;
                }
            }

            return json.substring(startIdx, endIdx).trim();
        } catch (Exception e) {
            return "";
        }
    }
}
