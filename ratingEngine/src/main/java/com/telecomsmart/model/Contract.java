
package com.telecomsmart.model;


import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 *
 * @author omar
 */
public class Contract {

    private String msisdn;
    private String contractName;
    private Integer creditLimit;
    private BigDecimal balance;

    private Integer customerId;
    private Integer ratePlanId;

    private LocalDateTime createdAt;

    private Customer customer;
    private RatePlan ratePlan;

    public String getMsisdn() {
        return msisdn;
    }

    public String getContractName() {
        return contractName;
    }

    public Integer getCreditLimit() {
        return creditLimit;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public Integer getRatePlanId() {
        return ratePlanId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Customer getCustomer() {
        return customer;
    }

    public RatePlan getRatePlan() {
        return ratePlan;
    }

    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }

    public void setContractName(String contractName) {
        this.contractName = contractName;
    }

    public void setCreditLimit(Integer creditLimit) {
        this.creditLimit = creditLimit;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public void setRatePlanId(Integer ratePlanId) {
        this.ratePlanId = ratePlanId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public void setRatePlan(RatePlan ratePlan) {
        this.ratePlan = ratePlan;
    }

}