package com.iti.listener;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.logging.Logger;

// for database connection 
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
//import java.sql.Connection;
import jakarta.servlet.ServletContext;

/**
 * Ensures the PostgreSQL JDBC Driver is safely registered and deregistered
 * across Tomcat web application hot reloads.
 */
@WebListener
public class AppContextListener implements ServletContextListener {
    
        private static final String DB_URL  = "jdbc:postgresql://ep-cool-heart-anf2054d-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require" ;//dotenv.get("DB_URL");
        private static final String DB_USER = "neondb_owner";//dotenv.get("DB_USER");
        private static final String DB_PASS = "npg_JcoqXx3KHIb5"; //dotenv.get("DB_PASSWORD");

    private static final Logger LOGGER = Logger.getLogger(AppContextListener.class.getName());

    @Override
    public void contextInitialized(ServletContextEvent sce) {
   
        try {
            Class.forName("org.postgresql.Driver");
            LOGGER.info("PostgreSQL JDBC Driver registered successfully on application startup.");
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "Could not find PostgreSQL Driver!", e);
        }

//        //initializing database connection 
//        try {
//            Class.forName("org.postgresql.Driver");
//            Connection con = DriverManager.getConnection(DB_URL,DB_USER,DB_PASS);
//            ServletContext ctx = sce.getServletContext();
//            ctx.setAttribute("connection", con);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        Enumeration<Driver> drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            Driver driver = drivers.nextElement();
            try {
                DriverManager.deregisterDriver(driver);
                LOGGER.log(Level.INFO, "Deregistered JDBC driver: {0}", driver);
            } catch (SQLException e) {
                LOGGER.log(Level.SEVERE, "Error deregistering JDBC driver", e);
            }

//            //closing database connection 
//            try {
//                Connection con = (Connection) sce.getServletContext().getAttribute("connection");
//                con.close();
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
        }
    }
}
