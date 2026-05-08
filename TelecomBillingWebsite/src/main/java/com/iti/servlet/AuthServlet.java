/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.iti.servlet;

import com.iti.dao.UserDao;
import com.iti.model.User;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

import java.io.*;

/**
 *
 * @author mahmoud
 */
@WebServlet("/auth")
public class AuthServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        PrintWriter out = res.getWriter();

        String username = req.getParameter("username");
        String password = req.getParameter("password");
        User user = UserDao.login(username, password);

        if (user != null) {
            HttpSession session = req.getSession();
            session.setAttribute("user", user);

            out.print(
                    "{\"username\":\"" + user.getUsername() +
                            "\",\"role\":\"" + user.getRole() + "\"}");
        } else {
            res.setStatus(401);
            out.print("{\"error\":\"Invalid credentials\"}");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession session = req.getSession(false);
        res.setContentType("application/json");
        if (session != null && session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            res.getWriter().print("{\"username\":\"" + user.getUsername() + "\",\"role\":\"" + user.getRole() + "\"}");
        } else {
            res.setStatus(401);
            res.getWriter().print("{\"error\":\"Not logged in\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        res.setContentType("application/json");
        res.getWriter().print("{\"message\":\"Logged out\"}");
    }
}