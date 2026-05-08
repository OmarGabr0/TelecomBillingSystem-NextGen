/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

import java.sql.*;
import java.util.*;

/**
 *
 * @author mohamed
 */
public class DataLoader {

    // ===============================
    // 1.Database Connection
    // ===============================
    private Connection con;

    public DataLoader(Connection con) {
        this.con = con;
    }

    // ===============================
    // 2.Get All Active Contracts
    // ===============================
    public List<String> getAllActiveContacts() {
        List<String> contracts = new ArrayList<>();
        String sql = "SELECT msisdn FROM contract ";

        try (PreparedStatement ps = con.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                contracts.add(rs.getString("msisdn"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return contracts;
    }

    // ================================
    // 3.Get Profile Data
    // ================================
    public Profile getProfile(String msisdn) {
        String sql = "SELECT * FROM customer_profile WHERE msisdn=?";
        double ror = 0;
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, msisdn);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new Profile(msisdn,
                        rs.getInt("rateplan_id"),
                        rs.getInt("data_units"),
                        rs.getInt("voice_units"),
                        rs.getInt("sms_units"),
                        rs.getInt("free_units"),
                        rs.getDate("billing_start"),
                        rs.getDate("billing_end"),
                        rs.getDouble("discount"),
                        rs.getDouble("ror_usage"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // ================================
    // 4.Get Rate Plan
    // ================================
    public RatePlan getRatePlan(int ratePlanID) {
        String sql = """
                     SELECT *
                     FROM rateplan
                     WHERE ratePlan_id=?
                     """;
        
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, ratePlanID);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                ServicePackages servicePackages = getServicePackages(ratePlanID);
                
                return new RatePlan(rs.getInt("rateplan_id"),
                        rs.getString("name"),
                        rs.getInt("free_units"),
                        servicePackages,
                        rs.getDouble("ror"),
                        rs.getDouble("plan_price"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    // ================================
    // 5.Get Service Packages
    // ================================ 
    public ServicePackages getServicePackages(int ratePlanID) {
        String sql = """
                     SELECT srp.units , srp.service_type
                     FROM service_rateplan sp
                     JOIN service_package srp ON srp.service_id=sp.service_id
                     WHERE sp.rateplan_id=?
                     """;
        
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            int dataUnits=0;
            int voiceUnits=0;
            int smsUnits=0;
            
            ps.setInt(1, ratePlanID);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                switch (rs.getInt("service_type")) {
                    case 1 -> voiceUnits=voiceUnits+rs.getInt("units");
                    case 2 -> smsUnits=smsUnits+rs.getInt("units");
                    case 3 -> dataUnits=dataUnits+rs.getInt("units");
                    
                    default -> {
                    }
                }
            }
            return new ServicePackages(voiceUnits,dataUnits, smsUnits);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    // =============================
    // 6.Get Recurring Fees
    // =============================
    public double getRecurringFees(String msisdn) {
        String sql = """
                SELECT COALESCE(SUM(rs.amount),0) AS total
                FROM contract_recurring cr
                JOIN recurring_service rs
                ON cr.recurring_id = rs.recurring_id
                WHERE cr.msisdn =  ?
                """;

        double total = 0;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, msisdn);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                total = rs.getDouble("total");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return total;
    }

    // =============================
    // 6.Get One-Time Fees
    // =============================
    public double getOneTimeFees(String msisdn) {
        String sql = """
                SELECT COALESCE(SUM(otf.amount),0) AS total
                FROM contract_fee cf
                JOIN onetime_fee otf
                ON cf.fee_id = otf.fee_id
                WHERE cf.msisdn = ?
                """;

        double total = 0;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, msisdn);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                total = rs.getDouble("total");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return total;
    }

    // =============================
    // 7.Get Customer Data
    // =============================
    public CustomerData getCustomerData(String msisdn) {

        String sql = """
        SELECT cu.*
        FROM customer cu 
        JOIN contract co ON cu.customer_id=co.customer_id           
        WHERE co.msisdn = ?
        """;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, msisdn);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new CustomerData(
                        rs.getInt("customer_id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("address")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }


    
}
