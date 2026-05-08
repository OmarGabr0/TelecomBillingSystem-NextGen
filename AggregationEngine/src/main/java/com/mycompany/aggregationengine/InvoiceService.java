/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

import java.sql.*;
import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 *
 * @author mohamed
 */
public class InvoiceService {

    public final DataLoader repo;
    private final Connection con;
    private final pdfService pdfService;

    public InvoiceService() {
        this.con = DatabaseConnection.getConnection();
        this.repo = new DataLoader(con);
        this.pdfService = new pdfService();
    }

    public void generateAllInvoices() {
        List<String> contracts = repo.getAllActiveContacts();
        for (String msisdn : contracts) {
            try {
                generateInvoice(msisdn);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void generateInvoice(String msisdn) {

        try {
            con.setAutoCommit(false);
            System.out.println("Processing: " + msisdn);

            // Get Data
            CustomerData customer = repo.getCustomerData(msisdn);
            if (customer == null) {
                System.out.println("No Customer Found → skip");
                con.rollback();
                return;
            }
            // Get Profile 

            Profile profile = repo.getProfile(msisdn);
            if (profile == null) {
                System.out.println("Profile Not Found → skip");
                con.rollback();
                return;
            }
            // Get Rate Plan

            RatePlan plan = repo.getRatePlan(profile.rate_plan_id);
            if (plan == null) {
                System.out.println("No Rate Plan Found → skip");
                con.rollback();
                return;
            }
            // Duplicate Check

            if (invoiceExists(profile)) {
                System.out.println("Invoice already exists → skip");
                con.rollback();
                return;
            }

            double oneTimeFees = repo.getOneTimeFees(msisdn);
            double recurringFees = repo.getRecurringFees(msisdn);
            // Calculate Total Invoice Cost 
            double ror = calculateROR(profile, plan);
            double subtotal = plan.price + ror + recurringFees + oneTimeFees;
            double discount = profile.discount;
            double taxRate = 0.1;

            double tax = (subtotal - discount) * taxRate;
            double total = subtotal - discount + tax;
            // Set Invoice Data (Build Object)
            InvoiceData data = new InvoiceData(msisdn,
                    plan.name,
                    profile.billing_start,
                    profile.billing_end,
                    customer,
                    plan.price,
                    recurringFees,
                    oneTimeFees,
                    ror,
                    subtotal,
                    discount,
                    tax,
                    total);
            // Generate PDF
            String pdfPath = pdfService.generate(data);
            // Insert Invoice
            insertInvoice(data, pdfPath);
            // reset 
            resetProfile(profile , plan);
            con.commit();
            System.out.println("Committed ✔ " + msisdn);
            
        } catch (Exception e) {

            try {
                con.rollback();
                System.out.println("Rolled back ❌ " + msisdn);
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            e.printStackTrace();
        } finally {
            try {
                con.setAutoCommit(true);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }

    // =========================
    // Check Duplication
    // =========================
    private boolean invoiceExists(Profile p) {

        String sql = """
        SELECT 1 FROM invoice
        WHERE msisdn = ?
        AND billing_start = ?
        AND billing_end = ?
        """;

        try (var ps = con.prepareStatement(sql)) {

            ps.setString(1, p.msisdn);
            ps.setDate(2, (Date) p.billing_start);
            ps.setDate(3, (Date) p.billing_end);

            var rs = ps.executeQuery();
            return rs.next();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    // =========================
    // Insert Invoice
    // =========================
    private void insertInvoice(InvoiceData data, String pdfPath) {

        String sql = """
        INSERT INTO invoice (
            msisdn,
            billing_start,
            billing_end,
            sub_total,
            discount,
            tax,
            total,
            pdf_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, data.msisdn);
            ps.setDate(2, (Date) data.billing_start);
            ps.setDate(3, (Date) data.billing_end);
            ps.setDouble(4, data.subtotal);
            ps.setDouble(5, data.discount);
            ps.setDouble(6, data.tax);
            ps.setDouble(7, data.total);
            ps.setString(8, pdfPath);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // =========================
    // Calculate Run On Rate
    // =========================
    private double calculateROR(Profile p, RatePlan R) {
        double ror = p.ror;
        // Calculate Days
        LocalDate start = p.billing_start.toLocalDate();
        LocalDate end = p.billing_end.toLocalDate();

        long days = ChronoUnit.DAYS.between(start, end)+1;
        
        // Compare Run On Rate
        if(days >= 30){
            return ror;
        }
        else{
            
            // Calculate new service packages units according to billcycle
            
            double ratio = (double)days/30;
            
            int freeUnits = (int) (ratio * R.free_units);
            int voiceUnits = (int) (ratio * R.servicePackages.voiceUnits);
            int totalVoiceUnits=freeUnits+voiceUnits;
            int dataUnits = (int) (ratio * R.servicePackages.dataUnits);
            int smsUnits = (int) (ratio * R.servicePackages.smsUnits);
            
            
            // Calculate bundles usage
            
            int freeUnitsUsed = R.free_units - p.free_units;
            int voiceUnitsUsed = R.servicePackages.voiceUnits - p.voice_units;
            int totalVoiceUnitsUsed = freeUnitsUsed + voiceUnitsUsed;
            if(totalVoiceUnitsUsed>totalVoiceUnits){
                ror=ror+(totalVoiceUnitsUsed-totalVoiceUnits)*R.ror_policy;
            }
            int dataUnitsUsed = R.servicePackages.dataUnits - p.data_units;
            if(dataUnitsUsed>dataUnits){
                ror=ror+(dataUnitsUsed-dataUnits)*R.ror_policy;
            }
            int smsUnitsUsed = R.servicePackages.smsUnits - p.sms_units;
            if(smsUnitsUsed>smsUnits){
                ror=ror+(smsUnitsUsed-smsUnits)*R.ror_policy;
            }
        }
        return ror;
        
    }

    // =========================
    // Reset Profile
    // =========================
    private void resetProfile(Profile profile , RatePlan plan) {
        
        LocalDate currentEnd = profile.billing_end.toLocalDate();

        // New Billcycle Start Date
        LocalDate newStart = currentEnd.plusDays(1);

        // New Billcycle End Date
        LocalDate newEnd = newStart.plusDays(29);
        
        String sql = """
                     UPDATE customer_profile SET ror_usage = 0,
                     voice_units=?,
                     data_units=?,
                     sms_units=?,
                     free_units=?,
                     billing_start=?,
                     billing_end=?
                     WHERE msisdn = ?
                     """;

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setInt(1, plan.servicePackages.voiceUnits);
            ps.setInt(2, plan.servicePackages.dataUnits);
            ps.setInt(3, plan.servicePackages.smsUnits);
            ps.setInt(4, plan.free_units);
            ps.setDate(5, java.sql.Date.valueOf(newStart));
            ps.setDate(6, java.sql.Date.valueOf(newEnd));
            ps.setString(7, profile.msisdn);
            ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
