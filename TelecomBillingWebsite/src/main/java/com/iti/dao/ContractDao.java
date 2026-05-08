package com.iti.dao;

import com.iti.util.DataBaseConnect;
import com.iti.util.JsonUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ContractDao {

    private static final Logger LOGGER = Logger.getLogger(ContractDao.class.getName());

    private static final String QRY_GET_CUSTOMER_ID = "SELECT customer_id FROM customer WHERE email = ?";

    private static final String QRY_GET_CONTRACTS = "SELECT c.msisdn, c.credit_limit, c.balance, c.created_at, " +
            "r.rateplan_id, r.name as rateplan_name, cu.email " +
            "FROM contract c " +
            "JOIN rateplan r ON c.rateplan_id = r.rateplan_id " +
            "JOIN customer cu ON c.customer_id = cu.customer_id " +
            "WHERE cu.email = ?";

    private static final String QRY_ADD_CONTRACT = "INSERT INTO contract (msisdn, credit_limit, balance, customer_id, rateplan_id) VALUES (?, ?, ?, ?, ?)";
    
    private static final String QRY_UPDATE_CONTRACT = "UPDATE contract SET rateplan_id = ?, credit_limit = ? WHERE msisdn = ?";

    public static String getContractsAsJson(String email) {
        StringBuilder json = new StringBuilder("[");
        try (Connection conn = DataBaseConnect.connect();
             PreparedStatement ps = conn.prepareStatement(QRY_GET_CONTRACTS)) {
             
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    json.append(String.format(
                            "{\"msisdn\":\"%s\", \"credit_limit\":%d, \"balance\":%f, \"rateplan_id\":%d, \"rateplan_name\":\"%s\", \"created_at\":\"%s\"},",
                            JsonUtil.escape(rs.getString("msisdn")),
                            rs.getInt("credit_limit"),
                            rs.getDouble("balance"),
                            rs.getInt("rateplan_id"),
                            JsonUtil.escape(rs.getString("rateplan_name")),
                            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toString() : "N/A"
                    ));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error fetching contracts", e);
        }
        
        if (json.length() > 1) json.setLength(json.length() - 1);
        return json.append("]").toString();
    }

    private static int getCustomerIdByEmail(String email, Connection conn) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(QRY_GET_CUSTOMER_ID)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("customer_id");
                }
            }
        }
        return -1;
    }

    private static final String QRY_ADD_PROFILE = "INSERT INTO customer_profile (msisdn, credit_limit, ror_usage, rateplan_id, data_units, voice_units, sms_units, free_units) VALUES (?, ?, 0, ?, 0, 0, 0, 0)";

    public static boolean addContract(String email, String msisdn, int rateplanId, int creditLimit, double balance) throws Exception {
        try (Connection conn = DataBaseConnect.connect()) {
            int customerId = getCustomerIdByEmail(email, conn);
            if (customerId == -1) {
                throw new Exception("Customer not found for email: " + email);
            }
            
            conn.setAutoCommit(false);
            try (PreparedStatement psContract = conn.prepareStatement(QRY_ADD_CONTRACT);
                 PreparedStatement psProfile = conn.prepareStatement(QRY_ADD_PROFILE)) {
                 
                psContract.setString(1, msisdn);
                psContract.setInt(2, creditLimit);
                psContract.setDouble(3, balance);
                psContract.setInt(4, customerId);
                psContract.setInt(5, rateplanId);
                int rowsContract = psContract.executeUpdate();
                
                psProfile.setString(1, msisdn);
                psProfile.setInt(2, creditLimit);
                psProfile.setInt(3, rateplanId);
                int rowsProfile = psProfile.executeUpdate();
                
                if (rowsContract > 0 && rowsProfile > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    private static final String QRY_UPDATE_PROFILE_RATEPLAN = "UPDATE customer_profile SET rateplan_id = ? WHERE msisdn = ?";

    public static boolean updateContract(String msisdn, int rateplanId, int creditLimit) throws Exception {
        try (Connection conn = DataBaseConnect.connect()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psContract = conn.prepareStatement(QRY_UPDATE_CONTRACT);
                 PreparedStatement psProfile = conn.prepareStatement(QRY_UPDATE_PROFILE_RATEPLAN)) {
                 
                psContract.setInt(1, rateplanId);
                psContract.setInt(2, creditLimit);
                psContract.setString(3, msisdn);
                int rowsContract = psContract.executeUpdate();
                
                psProfile.setInt(1, rateplanId);
                psProfile.setString(2, msisdn);
                int rowsProfile = psProfile.executeUpdate();
                
                if (rowsContract > 0 && rowsProfile > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }
}
