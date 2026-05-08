/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;
import javax.sql.DataSource;

/**
 *
 * @author mohamed
 */
public class DatabaseConnection {
    private static Connection connection;

    private static String url;
    private static String username;
    private static String password;

    static {
        try {
            Properties props = new Properties();

            InputStream input = DatabaseConnection.class
                    .getClassLoader()
                    .getResourceAsStream("application.properties");

            props.load(input);

            url = props.getProperty("db.url");
            username = props.getProperty("db.username");
            password = props.getProperty("db.password");

        } catch (Exception e) {
            System.out.println("Failed to load properties ❌");
            e.printStackTrace();
        }
    }

    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                connection = DriverManager.getConnection(url, username, password);
                System.out.println("DB Connected ✔");
            }
        } catch (Exception e) {
            System.out.println("DB Connection Failed ❌");
            e.printStackTrace();
        }

        return connection;
    }

    public static void close() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("DB Closed ✔");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
