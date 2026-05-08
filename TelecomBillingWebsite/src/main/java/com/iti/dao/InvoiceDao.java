package com.iti.dao;

import com.iti.util.DataBaseConnect;
import com.iti.util.JsonUtil;

import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public class InvoiceDao {

    private static final Logger LOGGER = Logger.getLogger(InvoiceDao.class.getName());

    public static String getInvoicesAsJson(String email, int limit, int offset, String sortBy, String sortOrder) {
        StringBuilder json = new StringBuilder("[");
        
        if (!"ASC".equalsIgnoreCase(sortOrder) && !"DESC".equalsIgnoreCase(sortOrder)) {
            sortOrder = "DESC";
        }
        
        String dbSortBy = "i.created_at";
        if ("total".equals(sortBy)) {
            dbSortBy = "i.total";
        } else if ("status".equals(sortBy)) {
            dbSortBy = "i.invoice_status";
        } else if ("id".equals(sortBy)) {
            dbSortBy = "i.invoice_id";
        }

        String sql = "SELECT i.invoice_id, i.msisdn, i.billing_start, i.billing_end, " +
                     "i.sub_total, i.tax, i.total, i.invoice_status, i.pdf_path " +
                     "FROM invoice i " +
                     "JOIN contract co ON i.msisdn = co.msisdn " +
                     "JOIN customer cu ON co.customer_id = cu.customer_id " +
                     "WHERE cu.email = ? " +
                     "ORDER BY " + dbSortBy + " " + sortOrder + " LIMIT ? OFFSET ?";

        try (Connection conn = DataBaseConnect.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ps.setInt(2, limit);
            ps.setInt(3, offset);
            
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String start = rs.getDate("billing_start") != null ? rs.getDate("billing_start").toString() : "N/A";
                    String end = rs.getDate("billing_end") != null ? rs.getDate("billing_end").toString() : "N/A";
                    
                    String status = JsonUtil.escape(rs.getString("invoice_status"));
                    String pdfPath = JsonUtil.escape(rs.getString("pdf_path"));

                    json.append(String.format(
                        "{\"invoice_id\":%d, \"msisdn\":\"%s\", \"start\":\"%s\", \"end\":\"%s\", " +
                        "\"sub_total\":%f, \"tax\":%f, \"total\":%f, \"status\":\"%s\", \"pdf_path\":\"%s\"},",
                        rs.getInt("invoice_id"), 
                        JsonUtil.escape(rs.getString("msisdn")), 
                        start, 
                        end,
                        rs.getDouble("sub_total"),
                        rs.getDouble("tax"),
                        rs.getDouble("total"),
                        status,
                        pdfPath
                    ));
                }
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error while fetching invoices", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error while fetching invoices", e);
        }

        if (json.length() > 1) {
            json.setLength(json.length() - 1);
        }
        json.append("]");

        return json.toString();
    }
}