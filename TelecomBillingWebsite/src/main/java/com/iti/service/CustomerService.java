/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.iti.service;

import com.iti.dao.CustomerDao;
import com.iti.model.Customer;

import java.util.List;

/**
 *
 * @author mahmoud
 */
public class CustomerService {

    public static List<Customer> getCustomers(int limit, int offset, String sortBy, String sortOrder, String searchQuery) {
        return CustomerDao.getAll(limit, offset, sortBy, sortOrder, searchQuery);
    }

    public static void addCustomer(Customer c) {
        CustomerDao.insert(c);
    }

    public static void updateCustomer(Customer c) {
        CustomerDao.update(c);
    }

    public static void deleteCustomer(String msisdn) {
        CustomerDao.delete(msisdn);
    }
}