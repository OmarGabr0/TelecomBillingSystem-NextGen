package com.telecomsmart.dao;

import com.telecomsmart.model.ZonePrice;
import com.telecomsmart.services.DataBaseConnect;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class ZonePriceDao {

    // Keep the old method
    public Map<Integer, ZonePrice> getZonePrices(int ratePlanId, int servicePackageId) {
        // ... (Keep your existing implementation here) ...
        Map<Integer, ZonePrice> zonePrices = new HashMap<>();
        String query = """
                SELECT z.dial_prefix, z.zone_id, rz.price_per_volume, rz.unit_deduction
                FROM tariff_zone z
                INNER JOIN rateplan_service_zone rz ON z.zone_id = rz.zone_id
                WHERE rz.rateplan_id = ? AND rz.service_package_id = ?
                """;
        Connection conn = DataBaseConnect.connect();
        if (conn == null) return zonePrices;
        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, ratePlanId);
            ps.setInt(2, servicePackageId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ZonePrice zonePrice = new ZonePrice();
                    zonePrice.setDialPrefix(rs.getString("dial_prefix"));
                    zonePrice.setZoneId(rs.getInt("zone_id"));
                    BigDecimal price = rs.getBigDecimal("price_per_volume");
                    zonePrice.setPricePerVolume(price != null ? price : BigDecimal.ZERO);
                    zonePrice.setUnitDeduction(rs.getLong("unit_deduction"));
                    zonePrices.put(zonePrice.getZoneId(), zonePrice);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); } 
        finally { DataBaseConnect.disconnect(conn); }
        return zonePrices;
    }

    // 🔹 NEW METHOD: Fetch ALL zone prices into Memory (Cache)
    public Map<String, Map<Integer, ZonePrice>> getAllZonePrices() {
        Map<String, Map<Integer, ZonePrice>> cache = new HashMap<>();
        String query = """
                SELECT rz.rateplan_id, rz.service_package_id, z.dial_prefix, z.zone_id, rz.price_per_volume, rz.unit_deduction
                FROM tariff_zone z
                INNER JOIN rateplan_service_zone rz ON z.zone_id = rz.zone_id
                """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) return cache;

        try (PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                String key = rs.getInt("rateplan_id") + "_" + rs.getInt("service_package_id");
                
                ZonePrice zonePrice = new ZonePrice();
                zonePrice.setDialPrefix(rs.getString("dial_prefix"));
                zonePrice.setZoneId(rs.getInt("zone_id"));
                BigDecimal price = rs.getBigDecimal("price_per_volume");
                zonePrice.setPricePerVolume(price != null ? price : BigDecimal.ZERO);
                zonePrice.setUnitDeduction(rs.getLong("unit_deduction"));

                // Group by the key (RatePlan + ServicePackage)
                cache.computeIfAbsent(key, k -> new HashMap<>()).put(zonePrice.getZoneId(), zonePrice);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }
        return cache;
    }

    public BigDecimal getDataPrice(int ratePlanId, int servicePackageId) {
        // ... (Keep your existing implementation here) ...
        return BigDecimal.ZERO; 
    }
}