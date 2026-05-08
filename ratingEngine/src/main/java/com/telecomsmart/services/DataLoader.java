//This is the class you call in main.
//It uses the DatabaseManager to run SELECT queries and converts the rows into the POJOs .
package com.telecomsmart.services;
import com.telecomsmart.model.Contract;
import java.sql.SQLException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
/**
 *
 * @author omar
 */
public class DataLoader {
    
    public Map<String,Contract> laodContracts(){
        Map<String, Contract> contractMap = new HashMap<>();
        String query = "SELECT msisdn, rateplan_id, balance FROM contract";
    try (Connection conn = DatabaseManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                Contract c = new Contract();
                c.setMsisdn(rs.getString("msisdn"));
                c.setRatePlanId(rs.getInt("rateplan_id"));
                // ... set other fields
                contractMap.put(c.getMsisdn(), c);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return contractMap;
    }
    
}
