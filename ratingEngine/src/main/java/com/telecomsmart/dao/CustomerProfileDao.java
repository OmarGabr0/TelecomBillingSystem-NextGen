package com.telecomsmart.dao;

import com.telecomsmart.model.CustomerProfile;
import com.telecomsmart.services.DataBaseConnect;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List; 
import java.util.Map;

// Database columns: 
// msisdn VARCHAR(15)
// credit_limit INTEGER
// ror_usage NUMERIC(10, 2)
// rateplan_id INTEGER
// free_data_units  BIGINT
// free_voice_units BIGINT
// free_sms_units  BIGINT

public class CustomerProfileDao {
    
    // Method to retrieve all customer profiles (Used for in-memory caching)
    public Map<String, CustomerProfile> getCustomerProfiles() {
        Map<String, CustomerProfile> customerProfiles = new HashMap<>();
        String query = """
                SELECT msisdn, credit_limit, ror_usage, rateplan_id, data_units, voice_units, sms_units, free_units
                FROM customer_profile
                """;
        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database.");
            return customerProfiles;
        }
        try (PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) { 
                CustomerProfile customerProfile = new CustomerProfile();    
                customerProfile.setMsisdn(rs.getString("msisdn"));
                customerProfile.setCreditLimit(rs.getInt("credit_limit"));
                customerProfile.setRorUsage(rs.getBigDecimal("ror_usage"));
                customerProfile.setRatePlanId(rs.getInt("rateplan_id"));
                customerProfile.setDataUnits(rs.getLong("data_units"));
                customerProfile.setVoiceUnits(rs.getLong("voice_units"));
                customerProfile.setSmsUnits(rs.getLong("sms_units"));
                customerProfile.setFreeUnits(rs.getLong("free_units"));
                customerProfiles.put(customerProfile.getMsisdn(), customerProfile);
            }
        } catch (SQLException e) {
            System.out.println("Error retrieving customer profiles.");
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }
        return customerProfiles;
    }

    // Method to create a new customer profile
    public boolean createCustomerProfile(CustomerProfile customerProfile) {
        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            return false;
        }
        String query = """
                INSERT INTO customer_profile (msisdn, credit_limit, ror_usage, rateplan_id, data_units, voice_units, sms_units, free_units)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, customerProfile.getMsisdn());
            ps.setInt(2, customerProfile.getCreditLimit());
            ps.setBigDecimal(3, customerProfile.getRorUsage());
            ps.setInt(4, customerProfile.getRatePlanId());
            ps.setLong(5, customerProfile.getDataUnits());
            ps.setLong(6, customerProfile.getVoiceUnits());
            ps.setLong(7, customerProfile.getSmsUnits());
            ps.setLong(8, customerProfile.getFreeUnits());
            ps.executeUpdate();
            return true;    
        } catch (SQLException e) {  
            System.out.println("Error creating customer profile.");
            e.printStackTrace();
            return false;
        } finally {
            DataBaseConnect.disconnect(conn);
        }
    }

    // Keep this method in case you need to update a single record later
    public boolean updateCustomerProfile(CustomerProfile customerProfile) {
        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            return false;
        }
        
        String query = """
                UPDATE customer_profile 
                SET ror_usage = ?, data_units = ?, voice_units = ?, sms_units = ?, free_units = ?
                WHERE msisdn = ?
                """;
                
        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setBigDecimal(1, customerProfile.getRorUsage());
            ps.setLong(2, customerProfile.getDataUnits());
            ps.setLong(3, customerProfile.getVoiceUnits());
            ps.setLong(4, customerProfile.getSmsUnits());
            ps.setLong(5, customerProfile.getFreeUnits());
            ps.setString(6, customerProfile.getMsisdn());
            
            ps.executeUpdate();
            return true;
            
        } catch (SQLException e) {
            System.out.println("Error updating profile for MSISDN: " + customerProfile.getMsisdn());
            e.printStackTrace();
            return false;
        } finally {
            DataBaseConnect.disconnect(conn);
        }
    }

    // 🔹 NEW METHOD: Batch Update to significantly boost performance
    public boolean updateCustomerProfilesBatch(List<CustomerProfile> customerProfiles) {
        // Check if the list is empty to avoid unnecessary DB calls
        if (customerProfiles == null || customerProfiles.isEmpty()) {
            return true;
        }

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database during batch update.");
            return false;
        }

        String query = """
                UPDATE customer_profile 
                SET ror_usage = ?, data_units = ?, voice_units = ?, sms_units = ?, free_units = ?
                WHERE msisdn = ?
                """;

        try {
            // 1. Disable auto-commit to ensure the batch is sent as a single transaction
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(query)) {
                for (CustomerProfile customer : customerProfiles) {
                    ps.setBigDecimal(1, customer.getRorUsage());
                    ps.setLong(2, customer.getDataUnits());
                    ps.setLong(3, customer.getVoiceUnits());
                    ps.setLong(4, customer.getSmsUnits());
                    ps.setLong(5, customer.getFreeUnits());
                    ps.setString(6, customer.getMsisdn());

                    // 2. Add this update command to the batch
                    ps.addBatch();
                }

                // 3. Execute all commands in the batch at once
                ps.executeBatch();
                
                // 4. Commit the changes to the database
                conn.commit();
                return true;

            } catch (SQLException e) {
                // In case of an error, rollback to maintain data integrity
                conn.rollback();
                System.out.println("Error during batch update. Transaction rolled back.");
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        } finally {
            // Restore default connection settings and close
            try {
                conn.setAutoCommit(true);
            } catch (SQLException e) {
                e.printStackTrace();
            }
            DataBaseConnect.disconnect(conn);
        }
    }
}