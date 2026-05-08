package com.telecomsmart.dao;

import com.telecomsmart.services.DataBaseConnect;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList;
import com.telecomsmart.model.CdrRecord;

public class CdrRecordDao {

    public List<CdrRecord> getAndDeleteCdrRecords() {
        List<CdrRecord> CDRs = new ArrayList<>();

        String query = """
                DELETE FROM cdr
                WHERE cdr_id IN (
                    SELECT cdr_id
                    FROM cdr
                    ORDER BY cdr_id
                    LIMIT 200
                )
                RETURNING *;
                """;

        Connection conn = DataBaseConnect.connect();
        if (conn == null) {
            System.out.println("Error connecting to the database");
            return CDRs;
        }

        try (PreparedStatement ps = conn.prepareStatement(query);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                CdrRecord CDR = new CdrRecord();
                CDR.setCdrId(rs.getInt("cdr_id"));
                CDR.setMsisdn(rs.getString("msisdn"));
                CDR.setDialB(rs.getString("dial_b"));
                CDR.setServiceId(rs.getInt("service_id"));
                CDR.setDurationVolume(rs.getLong("duration_volume"));
                CDR.setExternalFeesAmount(rs.getBigDecimal("external_fees_amount"));
                CDR.setCdrTimestamp(rs.getTimestamp("cdr_timestamp").toLocalDateTime());

                CDRs.add(CDR);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DataBaseConnect.disconnect(conn);
        }

        return CDRs;
    }
}