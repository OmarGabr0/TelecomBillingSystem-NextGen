package com.telecomsmart.model;

import java.time.LocalDateTime;

public class Customer {

    private Integer customerId;
    private String email;
    private String name;
    private String address;
    private LocalDateTime createdAt;

    // private List<Contract> contracts;

    // Constructors
    public Customer() {}

    public Customer(Integer customerId, String email, String name, String address, LocalDateTime createdAt) {
        this.customerId = customerId;
        this.email = email;
        this.name = name;
        this.address = address;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Customer{" + "customerId=" + customerId + ", email=" + email + ", name=" + name + ", address=" + address + ", createdAt=" + createdAt + '}';
    }
}