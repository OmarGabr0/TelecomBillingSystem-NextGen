package com.iti.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.iti.util.DataBaseConnect;
import com.iti.util.JsonUtil;

public class AnalyticsDao {

    private static final Logger LOGGER = Logger.getLogger(AnalyticsDao.class.getName());

    private static final String QRY_TOTAL_CUSTOMERS = "SELECT COUNT(*) FROM customer";

    private static final String QRY_REVENUE_BY_STATUS = "SELECT invoice_status, COALESCE(SUM(total), 0) FROM invoice GROUP BY invoice_status";

    private static final String QRY_INVOICE_COUNTS = "SELECT invoice_status, COUNT(*) FROM invoice GROUP BY invoice_status";

    private static final String QRY_RATEPLAN_POPULARITY = "SELECT r.name, COUNT(cp.msisdn) FROM rateplan r " +
            "LEFT JOIN customer_profile cp ON r.rateplan_id = cp.rateplan_id " +
            "GROUP BY r.name";

    private static final String QRY_USAGE_DISTRIBUTION = "SELECT sp.service_type, COALESCE(SUM(rc.units_usage), 0) FROM rated_cdr rc "
            +
            "JOIN service_package sp ON rc.service_id = sp.service_id " +
            "GROUP BY sp.service_type";

    public static String getDashboardAnalyticsAsJson() {
        long totalCustomers = 0;
        double totalRevenue = 0.0;
        double pendingRevenue = 0.0;

        StringBuilder invoiceCounts = new StringBuilder("{");
        StringBuilder rateplanPop = new StringBuilder("{");
        StringBuilder usageDist = new StringBuilder("{");

        try (Connection conn = DataBaseConnect.connect()) {

            try (PreparedStatement ps = conn.prepareStatement(QRY_TOTAL_CUSTOMERS);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    totalCustomers = rs.getLong(1);
                }
            }

            try (PreparedStatement ps = conn.prepareStatement(QRY_REVENUE_BY_STATUS);
                    ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String status = rs.getString(1);
                    double amount = rs.getDouble(2);
                    if ("Paid".equalsIgnoreCase(status)) {
                        totalRevenue = amount;
                    } else if ("Pending".equalsIgnoreCase(status)) {
                        pendingRevenue = amount;
                    }
                }
            }

            try (PreparedStatement ps = conn.prepareStatement(QRY_INVOICE_COUNTS);
                    ResultSet rs = ps.executeQuery()) {
                boolean first = true;
                while (rs.next()) {
                    if (!first) {
                        invoiceCounts.append(",");
                    }
                    String status = JsonUtil.escape(rs.getString(1));
                    invoiceCounts.append(String.format("\"%s\": %d", status, rs.getLong(2)));
                    first = false;
                }
            }
            invoiceCounts.append("}");

            try (PreparedStatement ps = conn.prepareStatement(QRY_RATEPLAN_POPULARITY);
                    ResultSet rs = ps.executeQuery()) {
                boolean first = true;
                while (rs.next()) {
                    if (!first) {
                        rateplanPop.append(",");
                    }
                    String planName = JsonUtil.escape(rs.getString(1));
                    rateplanPop.append(String.format("\"%s\": %d", planName, rs.getLong(2)));
                    first = false;
                }
            }
            rateplanPop.append("}");

            try (PreparedStatement ps = conn.prepareStatement(QRY_USAGE_DISTRIBUTION);
                    ResultSet rs = ps.executeQuery()) {
                boolean first = true;
                while (rs.next()) {
                    int type = rs.getInt(1);
                    long units = rs.getLong(2);
                    String label = type == 1 ? "Voice" : (type == 2 ? "SMS" : "Data");

                    if (!first) {
                        usageDist.append(",");
                    }
                    usageDist.append(String.format("\"%s\": %d", label, units));
                    first = false;
                }
            }
            usageDist.append("}");

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error while fetching analytics", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error while fetching analytics", e);
        }

        if (invoiceCounts.length() == 1)
            invoiceCounts.append("}");
        if (rateplanPop.length() == 1)
            rateplanPop.append("}");
        if (usageDist.length() == 1)
            usageDist.append("}");

        return String.format(
                "{\"totalCustomers\": %d, \"totalRevenue\": %.2f, \"pendingRevenue\": %.2f, \"invoiceCounts\": %s, \"rateplanPopularity\": %s, \"usageDistribution\": %s}",
                totalCustomers, totalRevenue, pendingRevenue, invoiceCounts.toString(), rateplanPop.toString(),
                usageDist.toString());
    }
}
