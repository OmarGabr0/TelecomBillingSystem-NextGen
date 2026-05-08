package com.telecomsmart.dao;

import com.telecomsmart.model.TariffZone;
import com.telecomsmart.services.DataBaseConnect;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class TarrifZoneDao {

    /**
     * Loads all zones from tariff_zone.
     * Key: dial_prefix, Value: TariffZone.
     */
    public Map<String, TariffZone> getZoneMaping() {
        Map<String, TariffZone> zoneMaping = new HashMap<>();
        String query = """
                SELECT zone_id, dial_prefix, zone_name, description, distenation_name
                FROM tariff_zone
                """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database");
            return zoneMaping;
        }

        try (PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                TariffZone zone = new TariffZone();
                zone.setZoneId(rs.getInt("zone_id"));
                zone.setDialPrefix(rs.getString("dial_prefix"));
                zone.setZoneName(rs.getString("zone_name"));
                zone.setDescription(rs.getString("description"));
                zone.setDestinationName(rs.getString("distenation_name"));

                zoneMaping.put(zone.getDialPrefix(), zone);
            }
        } catch (SQLException e) {
            System.out.println("Error loading tariff zones");
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }

        return zoneMaping;
    }
}