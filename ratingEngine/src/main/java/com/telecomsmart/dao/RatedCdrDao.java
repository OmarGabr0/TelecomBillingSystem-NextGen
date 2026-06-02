package com.telecomsmart.dao;

import com.telecomsmart.model.RatedCdr;
import com.telecomsmart.services.DataBaseConnect;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;

public class RatedCdrDao {

    public boolean insertBatch(List<RatedCdr> ratedCdrs) {

        String sql =
        "INSERT INTO rated_cdr " +
        "(cdr_id, processed_at, msisdn, rounded_duration, ror_usage, units_usage, service_id) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DataBaseConnect.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            conn.setAutoCommit(false);

            for (RatedCdr r : ratedCdrs) {
                ps.setLong(1, r.getCdrId());
                ps.setTimestamp(2, r.getProcessedAt());
                ps.setString(3, r.getMsisdn());
                ps.setLong(4, r.getRoundedDuration());
                ps.setBigDecimal(5, r.getRorUsage());
                ps.setLong(6, r.getUnitsUsage());
                ps.setInt(7, r.getServiceId());

                ps.addBatch();
            }

            ps.executeBatch();
            conn.commit();

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}