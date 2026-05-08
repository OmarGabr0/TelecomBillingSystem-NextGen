package com.iti.dao;

import com.iti.model.Customer;
import com.iti.util.DataBaseConnect;

import java.sql.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomerDao {

    private static final Logger LOGGER = Logger.getLogger(CustomerDao.class.getName());

    private static final String QRY_INSERT = "INSERT INTO customer (email, name, address) VALUES (?, ?, ?)";
    private static final String QRY_UPDATE = "UPDATE customer SET name=? WHERE email=?";
    private static final String QRY_DELETE = "DELETE FROM customer WHERE email=?";

    public static List<Customer> getAll(int limit, int offset, String sortBy, String sortOrder, String searchQuery) {
        List<Customer> list = new ArrayList<>();

        List<String> allowedSortCols = Arrays.asList("name", "email", "created_at");
        if (!allowedSortCols.contains(sortBy)) {
            sortBy = "name";
        }
        if (!"ASC".equalsIgnoreCase(sortOrder) && !"DESC".equalsIgnoreCase(sortOrder)) {
            sortOrder = "ASC";
        }

        String sql = "SELECT * FROM customer";
        boolean hasSearch = searchQuery != null && !searchQuery.trim().isEmpty();
        if (hasSearch) {
            sql += " WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ?";
        }
        sql += " ORDER BY " + sortBy + " " + sortOrder + " LIMIT ? OFFSET ?";

        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            int paramIndex = 1;
            if (hasSearch) {
                String likePattern = "%" + searchQuery.trim().toLowerCase() + "%";
                ps.setString(paramIndex++, likePattern);
                ps.setString(paramIndex++, likePattern);
            }
            ps.setInt(paramIndex++, limit);
            ps.setInt(paramIndex++, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Customer c = new Customer();
                    c.setEmail(rs.getString("email"));
                    c.setName(rs.getString("name"));
                    c.setAddress(rs.getString("address"));

                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) {
                        c.setCreated_at(ts.toLocalDateTime());
                    }

                    list.add(c);
                }
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error while fetching customers", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error while fetching customers", e);
        }

        return list;
    }

    private static final String QRY_INSERT_USER = "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')";

    public static void insert(Customer c) {
        try (Connection conn = DataBaseConnect.connect()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psCustomer = conn.prepareStatement(QRY_INSERT);
                    PreparedStatement psUser = conn.prepareStatement(QRY_INSERT_USER)) {

                psCustomer.setString(1, c.getEmail());
                psCustomer.setString(2, c.getName());
                psCustomer.setString(3, c.getAddress());
                int rowsCustomer = psCustomer.executeUpdate();

                psUser.setString(1, c.getEmail());
                psUser.setString(2, "123"); // Default password
                int rowsUser = psUser.executeUpdate();

                if (rowsCustomer > 0 && rowsUser > 0) {
                    conn.commit();
                } else {
                    conn.rollback();
                }
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error while inserting customer and generating account", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error while inserting customer", e);
        }
    }

    public static void update(Customer c) {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_UPDATE)) {

            ps.setString(1, c.getName());
            ps.setString(2, c.getEmail());
            ps.executeUpdate();

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error while updating customer", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error while updating customer", e);
        }
    }

    public static void delete(String email) {
        try (Connection conn = DataBaseConnect.connect();
                PreparedStatement ps = conn.prepareStatement(QRY_DELETE)) {

            ps.setString(1, email);
            ps.executeUpdate();

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error while deleting customer", e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error while deleting customer", e);
        }
    }
}