package com.iti.servlet;

import com.iti.dao.AnalyticsDao;
import com.iti.model.User;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

import java.io.*;

@WebServlet("/analytics")
public class AnalyticsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        
        res.setContentType("application/json");
        HttpSession session = req.getSession(false);

        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().print("{\"error\": \"Unauthorized\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.getWriter().print("{\"error\": \"Forbidden\"}");
            return;
        }

        res.getWriter().print(AnalyticsDao.getDashboardAnalyticsAsJson());
    }
}
