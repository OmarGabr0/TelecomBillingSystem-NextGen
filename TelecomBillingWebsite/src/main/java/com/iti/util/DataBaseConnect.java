/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.iti.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import io.github.cdimascio.dotenv.Dotenv;

/**
 *
 * @author mahmoud
 */

public class DataBaseConnect {

    //private static final Dotenv dotenv = Dotenv.load();
    private static final String DB_URL = "jdbc:postgresql://ep-cool-heart-anf2054d-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require";//dotenv.get("DB_URL");
    private static final String DB_USER = "neondb_owner";//dotenv.get("DB_USER");
    private static final String DB_PASS = "npg_JcoqXx3KHIb5";//dotenv.get("DB_PASSWORD");

    // Build JDBC URL from environment variables.
    // Set DB_URL to the full JDBC connection string, e.g.:
    //   jdbc:postgresql://<host>/<db>?user=<user>&password=<pass>&sslmode=require
    // Alternatively, set DB_USER and DB_PASSWORD separately and use a plain host URL.
    private static final String URL = (DB_URL != null) ? DB_URL
            : "jdbc:postgresql://ep-cool-heart-anf2054d.c-6.us-east-1.aws.neon.tech/neondb"
            + "?user=" + DB_USER + "&password=" + DB_PASS + "&sslmode=require";

    public static Connection connect() {

        try {
            Class.forName("org.postgresql.Driver");

        } catch (ClassNotFoundException e) {

            System.err.println("FATAL: PostgreSQL Driver not found in WEB-INF/lib!");
            e.printStackTrace();

            return null;
        }

        try {

            return DriverManager.getConnection(URL, DB_USER, DB_PASS);

        } catch (SQLException e) {

            System.err.println("WARN: Database connection failed (possible cold start). Retrying in 2 seconds...");

            try {
                Thread.sleep(2000);

            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }

            try {

                return DriverManager.getConnection(URL, DB_USER, DB_PASS);

            } catch (SQLException retryException) {

                System.err.println("FATAL: Database connection retry failed!");
                retryException.printStackTrace();

                return null;
            }
        }
    }
}
