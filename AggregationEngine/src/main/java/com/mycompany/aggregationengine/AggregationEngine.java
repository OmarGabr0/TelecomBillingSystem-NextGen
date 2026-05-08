/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.aggregationengine;

import java.sql.Connection;


/**
 *
 * @author mohamed
 */
public class AggregationEngine {

    public static void main(String[] args) {
        InvoiceService invoice = new InvoiceService();
        invoice.generateAllInvoices();
        
    }
}
