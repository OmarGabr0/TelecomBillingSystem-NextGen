package com.iti.dao;

import com.iti.util.DataBaseConnect;
import com.iti.util.JsonUtil;

import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ProfileDao {

    private static final Logger LOGGER = Logger.getLogger(ProfileDao.class.getName());

    private static final String QRY_RATEPLANS = "SELECT rateplan_id, name, ror, plan_price, free_units FROM rateplan ORDER BY %s %s LIMIT ? OFFSET ?";
    private static final String QRY_ADD_RATEPLAN = "INSERT INTO rateplan (name, ror, description, plan_price, free_units) VALUES (?, ?, ?, ?, ?)";
    private static final String QRY_SERVICES = "SELECT service_id, description, rating_price, service_type, units FROM service_package";
    private static final String QRY_ADD_SERVICE = "INSERT INTO service_package (service_type, description, rating_price, units, zone_id) VALUES (?, ?, ?, ?, ?)";

    private static final String QRY_ALL_FEES_BASE = "SELECT * FROM (" +
            "SELECT recurring_id as id, name, description, amount, 'recurring' as type FROM recurring_service " +
            "UNION ALL " +
            "SELECT fee_id as id, name, description, amount, 'onetime' as type FROM onetime_fee" +
            ") as combined_fees";

    private static final String QRY_ASSIGN_RECURRING = "INSERT INTO contract_recurring (msisdn, recurring_id) VALUES (?, ?)";
    private static final String QRY_ASSIGN_ONETIME = "INSERT INTO contract_fee (msisdn, fee_id) VALUES (?, ?)";

    private static final String QRY_DEL_SERVICE_RATEPLAN = "DELETE FROM service_rateplan WHERE rateplan_id = ? AND service_id IN "
            +
            "(SELECT service_id FROM service_package WHERE service_type = " +
            "(SELECT service_type FROM service_package WHERE service_id = ?))";

    private static final String QRY_INS_SERVICE_RATEPLAN = "INSERT INTO service_rateplan (rateplan_id, service_id) VALUES (?, ?)";

    private static final String QRY_RATEPLAN_SERVICES = "SELECT sp.service_id, sp.description, sp.rating_price, sp.service_type, sp.units "
            +
            "FROM service_package sp JOIN service_rateplan sr ON sp.service_id = sr.service_id WHERE sr.rateplan_id = ?";

    private static final String QRY_ADD_RECURRING = "INSERT INTO recurring_service (name, description, amount) VALUES (?, ?, ?)";
    private static final String QRY_ADD_ONETIME_FEE = "INSERT INTO onetime_fee (name, description, amount) VALUES (?, ?, ?)";

    private static final String QRY_CUSTOMER_PROFILES = "SELECT c.name as customer_name, cp.msisdn, "
            + "cp.credit_limit, cp.ror_usage, "
            + "cp.data_units as rem_data, cp.voice_units as rem_voice, cp.sms_units as rem_sms, cp.free_units as rem_free, "
            + "r.name as rateplan_name, r.free_units as total_free, "
            + "(SELECT COALESCE(SUM(sp.units), 0) FROM service_rateplan sr JOIN service_package sp ON sr.service_id = sp.service_id WHERE sr.rateplan_id = cp.rateplan_id AND sp.service_type = 1) as total_voice, "
            + "(SELECT COALESCE(SUM(sp.units), 0) FROM service_rateplan sr JOIN service_package sp ON sr.service_id = sp.service_id WHERE sr.rateplan_id = cp.rateplan_id AND sp.service_type = 2) as total_sms, "
            + "(SELECT COALESCE(SUM(sp.units), 0) FROM service_rateplan sr JOIN service_package sp ON sr.service_id = sp.service_id WHERE sr.rateplan_id = cp.rateplan_id AND sp.service_type = 3) as total_data "
            + "FROM customer_profile cp "
            + "JOIN contract co ON cp.msisdn = co.msisdn "
            + "JOIN customer c ON co.customer_id = c.customer_id "
            + "JOIN rateplan r ON cp.rateplan_id = r.rateplan_id "
            + "WHERE c.email = ?";

    public static String getRateplansAsJson(int limit, int offset, String sortBy, String sortOrder) {
        StringBuilder json = new StringBuilder("[");

        if (!"ASC".equalsIgnoreCase(sortOrder) && !"DESC".equalsIgnoreCase(sortOrder)) {
            sortOrder = "DESC";
        }

        String dbSortBy = "rateplan_id";
        if ("name".equals(sortBy))
            dbSortBy = "name";
        else if ("price".equals(sortBy))
            dbSortBy = "plan_price";
        else if ("units".equals(sortBy))
            dbSortBy = "free_units";

        String sql = String.format(QRY_RATEPLANS, dbSortBy, sortOrder);

        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    json.append(String.format(
                            "{\"id\":%d, \"name\":\"%s\", \"ror\":%f, \"price\":%f, \"free_units\":%d},",
                            rs.getInt("rateplan_id"),
                            JsonUtil.escape(rs.getString("name")),
                            rs.getDouble("ror"),
                            rs.getDouble("plan_price"),
                            rs.getLong("free_units")));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error fetching rateplans", e);
        }

        if (json.length() > 1)
            json.setLength(json.length() - 1);
        return json.append("]").toString();
    }

    public static void addRateplan(String name, double ror, String description, double price, long freeUnits)
            throws Exception {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_ADD_RATEPLAN)) {
            ps.setString(1, name);
            ps.setDouble(2, ror);
            ps.setString(3, description);
            ps.setDouble(4, price);
            ps.setLong(5, freeUnits);
            ps.executeUpdate();
        }
    }

    public static String getServicesAsJson() {
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_SERVICES);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                String type = rs.getInt("service_type") == 1 ? "Voice"
                        : (rs.getInt("service_type") == 2 ? "SMS" : "Data");
                json.append(String.format(
                        "{\"id\":%d, \"name\":\"%s\", \"price\":%f, \"type\":\"%s\", \"units\":%d},",
                        rs.getInt("service_id"),
                        JsonUtil.escape(rs.getString("description")),
                        rs.getDouble("rating_price"),
                        type,
                        rs.getLong("units")));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error fetching services", e);
        }

        if (json.length() > 1)
            json.setLength(json.length() - 1);
        return json.append("]").toString();
    }

    public static void addServicePackage(int type, String description, double price, long units, int zoneId)
            throws Exception {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_ADD_SERVICE)) {
            ps.setInt(1, type);
            ps.setString(2, description);
            ps.setDouble(3, price);
            ps.setLong(4, units);
            ps.setInt(5, zoneId);
            ps.executeUpdate();
        }
    }

    public static String getAllFeesAsJson(int limit, int offset, String sortBy, String sortOrder, String filter) {
        StringBuilder json = new StringBuilder("[");

        if (!"ASC".equalsIgnoreCase(sortOrder) && !"DESC".equalsIgnoreCase(sortOrder)) {
            sortOrder = "ASC";
        }

        String dbSortBy = "name";
        if ("amount".equals(sortBy))
            dbSortBy = "amount";

        String sql = QRY_ALL_FEES_BASE;
        if ("recurring".equals(filter)) {
            sql += " WHERE type = 'recurring'";
        } else if ("onetime".equals(filter)) {
            sql += " WHERE type = 'onetime'";
        }
        sql += " ORDER BY " + dbSortBy + " " + sortOrder + " LIMIT ? OFFSET ?";

        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    json.append(String.format(
                            "{\"id\":%d, \"name\":\"%s\", \"description\":\"%s\", \"amount\":%f, \"type\":\"%s\"},",
                            rs.getInt("id"),
                            JsonUtil.escape(rs.getString("name")),
                            JsonUtil.escape(rs.getString("description")),
                            rs.getDouble("amount"),
                            JsonUtil.escape(rs.getString("type"))));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error fetching fees", e);
        }

        if (json.length() > 1)
            json.setLength(json.length() - 1);
        return json.append("]").toString();
    }

    public static void assignRecurringService(String msisdn, int recurringId) throws Exception {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_ASSIGN_RECURRING)) {
            ps.setString(1, msisdn);
            ps.setInt(2, recurringId);
            ps.executeUpdate();
        }
    }

    public static void assignOneTimeFee(String msisdn, int feeId) throws Exception {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_ASSIGN_ONETIME)) {
            ps.setString(1, msisdn);
            ps.setInt(2, feeId);
            ps.executeUpdate();
        }
    }

    public static void linkServiceToRateplan(int rateplanId, int serviceId) throws Exception {
        try (Connection conn = DataBaseConnect.connect()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psDel = conn.prepareStatement(QRY_DEL_SERVICE_RATEPLAN);
                    PreparedStatement psIns = conn.prepareStatement(QRY_INS_SERVICE_RATEPLAN)) {

                psDel.setInt(1, rateplanId);
                psDel.setInt(2, serviceId);
                psDel.executeUpdate();

                psIns.setInt(1, rateplanId);
                psIns.setInt(2, serviceId);
                psIns.executeUpdate();

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public static String getRateplanServicesAsJson(int rateplanId) {
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_RATEPLAN_SERVICES)) {
            ps.setInt(1, rateplanId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String type = rs.getInt("service_type") == 1 ? "Voice"
                            : (rs.getInt("service_type") == 2 ? "SMS" : "Data");

                    json.append(String.format(
                            "{\"id\":%d, \"name\":\"%s\", \"price\":%f, \"type\":\"%s\", \"units\":%d},",
                            rs.getInt("service_id"),
                            JsonUtil.escape(rs.getString("description")),
                            rs.getDouble("rating_price"),
                            type,
                            rs.getLong("units")));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error fetching rateplan services", e);
        }

        if (json.length() > 1)
            json.setLength(json.length() - 1);
        return json.append("]").toString();
    }

    public static void addRecurringService(String name, String description, double amount) throws Exception {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_ADD_RECURRING)) {
            ps.setString(1, name);
            ps.setString(2, description);
            ps.setDouble(3, amount);
            ps.executeUpdate();
        }
    }

    public static void addOneTimeFee(String name, String description, double amount) throws Exception {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_ADD_ONETIME_FEE)) {
            ps.setString(1, name);
            ps.setString(2, description);
            ps.setDouble(3, amount);
            ps.executeUpdate();
        }
    }

    public static String getCustomerProfilesAsJson(String email) {
        StringBuilder json = new StringBuilder("[");

        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_CUSTOMER_PROFILES)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    json.append(String.format(
                            "{\"customer_name\":\"%s\", \"msisdn\":\"%s\", \"rateplan_name\":\"%s\", \"credit_limit\":%d, \"ror_usage\":%.2f, \"data_units\":%d, \"total_data\":%d, \"voice_units\":%d, \"total_voice\":%d, \"sms_units\":%d, \"total_sms\":%d, \"free_units\":%d, \"total_free\":%d},",
                            JsonUtil.escape(rs.getString("customer_name")),
                            JsonUtil.escape(rs.getString("msisdn")),
                            JsonUtil.escape(rs.getString("rateplan_name")),
                            rs.getInt("credit_limit"),
                            rs.getDouble("ror_usage"),
                            rs.getLong("rem_data"),
                            rs.getLong("total_data"),
                            rs.getLong("rem_voice"),
                            rs.getLong("total_voice"),
                            rs.getLong("rem_sms"),
                            rs.getLong("total_sms"),
                            rs.getLong("rem_free"),
                            rs.getLong("total_free")));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error fetching customer profiles", e);
        }

        if (json.length() > 1)
            json.setLength(json.length() - 1);
        return json.append("]").toString();
    }
}