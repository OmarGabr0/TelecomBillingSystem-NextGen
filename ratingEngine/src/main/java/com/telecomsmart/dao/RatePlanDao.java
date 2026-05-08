package com.telecomsmart.dao;

import com.telecomsmart.model.RatePlan;
import com.telecomsmart.services.DataBaseConnect;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class RatePlanDao {

    public RatePlan getRatePlanByID(Integer id) {
        RatePlan ratePlan = new RatePlan();
        String query = """
                SELECT rateplan_id, name, description, free_units, plan_price
                FROM rateplan
                WHERE rateplan_id = ?
                """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database");
            return ratePlan;
        }

        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ratePlan.setRatePlanId(rs.getInt("rateplan_id"));
                    ratePlan.setName(rs.getString("name"));
                    ratePlan.setDescription(rs.getString("description"));
                    ratePlan.setFreeUnits(rs.getLong("free_units"));
                    ratePlan.setPlanPrice(rs.getFloat("plan_price"));
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting rate plan by id");
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }

        return ratePlan;
    }
    // retrive all rate plans in the database (rate plan id , rate plan object)
    public Map<Integer, RatePlan> getRatePlans() {
        Map<Integer, RatePlan> ratePlans = new HashMap<>();

        String query = """
            SELECT rateplan_id, name, description, free_units, plan_price
            FROM rateplan
            """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database");
            return ratePlans;
        }

        try (PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                RatePlan ratePlan = new RatePlan();
                ratePlan.setRatePlanId(rs.getInt("rateplan_id"));
                ratePlan.setName(rs.getString("name"));
                ratePlan.setDescription(rs.getString("description"));
                ratePlan.setFreeUnits(rs.getLong("free_units"));
                ratePlan.setPlanPrice(rs.getFloat("plan_price"));
                ratePlans.put(ratePlan.getRatePlanId(), ratePlan);
            }
        } catch (SQLException e) {
            System.out.println("Error getting rate plans");
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }

        return ratePlans;
    }
}