/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

import java.sql.Date;

/**
 *
 * @author mohamed
 */
public class InvoiceData {

    public String msisdn;
    
    public String  ratePlanName;

    public Date billing_start;
    public Date billing_end;
    
    public CustomerData customer;
    
    public double monthly;
    public double recurring;
    public double oneTime;
    public double ror;
    
    public double subtotal;
    public double discount;
    public double tax;
    public double total;

   public InvoiceData(String msisdn, String ratePlanName, Date billing_start,Date billing_end, CustomerData customer, double monthly, double recurring, double oneTime, double ror, double subtotal, double discount, double tax, double total) {
        this.msisdn = msisdn;
        this.ratePlanName = ratePlanName;
        
        this.billing_start= billing_start;
        this.billing_end=billing_end;
        
        this.customer = customer;
        
        this.monthly = monthly;
        this.recurring = recurring;
        this.oneTime = oneTime;
        
        this.ror = ror;
        this.subtotal = subtotal;
        this.discount = discount;
        this.tax = tax;
        this.total = total;
    }
    
    

}
