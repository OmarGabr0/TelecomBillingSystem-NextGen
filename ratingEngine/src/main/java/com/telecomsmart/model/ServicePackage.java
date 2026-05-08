/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.telecomsmart.model;

import java.math.BigDecimal;

/**
 *
 * @author omar
 */

public class ServicePackage {
    private Integer serviceId;
    private Integer serviceType; // 1=voice, 2=sms, 3=data
    private String description;
    private BigDecimal ratingPrice;
    private Long units;
    private Integer zoneId;

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public Integer getServiceType() {
        return serviceType;
    }

    public void setServiceType(Integer serviceType) {
        this.serviceType = serviceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getRatingPrice() {
        return ratingPrice;
    }

    public void setRatingPrice(BigDecimal ratingPrice) {
        this.ratingPrice = ratingPrice;
    }

    public Long getUnits() {
        return units;
    }

    public void setUnits(Long units) {
        this.units = units;
    }

    public Integer getZoneId() {
        return zoneId;
    }

    public void setZoneId(Integer zoneId) {
        this.zoneId = zoneId;
    }
}
