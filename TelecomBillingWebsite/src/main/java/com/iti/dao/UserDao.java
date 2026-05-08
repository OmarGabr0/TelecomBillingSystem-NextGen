package com.iti.dao;

import com.iti.model.User;
import com.iti.util.DataBaseConnect;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class UserDao {

    private static final Logger LOGGER = Logger.getLogger(UserDao.class.getName());
    private static final String QRY_LOGIN = "SELECT * FROM users WHERE username=? AND password=?";

    public static User login(String username, String password) {
        try (Connection conn = DataBaseConnect.connect();
             PreparedStatement ps = conn.prepareStatement(QRY_LOGIN)) {

            ps.setString(1, username);
            ps.setString(2, password);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    User u = new User();
                    u.setUsername(rs.getString("username"));
                    u.setRole(rs.getString("role"));
                    return u;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error during login", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error during login", e);
        }

        return null;
    }
}