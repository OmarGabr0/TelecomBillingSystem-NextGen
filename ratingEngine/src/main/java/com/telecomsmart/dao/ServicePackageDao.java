package com.telecomsmart.dao;

import com.telecomsmart.services.DataBaseConnect;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class ServicePackageDao {

    // Keep the old method just in case it's used elsewhere
    public Integer getServicePackageId(int ratePlanId, int serviceType) {
        String query = """
                SELECT sp.service_id
                FROM service_package sp
                JOIN service_rateplan sr ON sp.service_id = sr.service_id
                WHERE sr.rateplan_id = ?
                AND sp.service_type = ?
                """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, ratePlanId);
            ps.setInt(2, serviceType);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("service_id");
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting service package id");
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }

        return null;
    }

    // 🔹 NEW METHOD: Fetch all service packages into Memory (Cache)
    public Map<String, Integer> getAllServicePackages() {
        Map<String, Integer> cache = new HashMap<>();
        String query = """
                SELECT sr.rateplan_id, sp.service_type, sp.service_id
                FROM service_package sp
                JOIN service_rateplan sr ON sp.service_id = sr.service_id
                """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            return cache;
        }

        try (PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                // Create a unique key: "ratePlanId_serviceType"
                String key = rs.getInt("rateplan_id") + "_" + rs.getInt("service_type");
                cache.put(key, rs.getInt("service_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }
        return cache;
    }
}