package com.telecomsmart.services;

import java.sql.Connection;
import java.sql.SQLException;

public class DataBaseConnect {

    private DataBaseConnect() {
        // utility class
    }

    public static Connection connect() {
        try {
            return DatabaseManager.getConnection();
        } catch (SQLException e) {
            System.out.println("Error connecting to the database");
            return null;
        }
    }

    public static void disconnect(Connection con) {
        if (con != null) {
            try {
                con.close();
            } catch (SQLException e) {
                System.out.println("Error disconnecting from the database");
            }
        }
    }
}