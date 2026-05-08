package com.telecomsmart.model;

import java.math.BigDecimal;

public class ZonePrice { 
    private String dialPrefix;
    private Integer zoneId;
    private BigDecimal pricePerVolume;
    private Long unitDeduction;

    //  DATA pricing factory 
    public static ZonePrice forData() {
        ZonePrice zp = new ZonePrice();
        zp.setZoneId(null);
        zp.setPricePerVolume(new BigDecimal("0.30")); // per MB
        zp.setUnitDeduction(1L);
        return zp;
    }

    public String getDialPrefix() {
        return dialPrefix;
    }

    public void setDialPrefix(String dialPrefix) {
        this.dialPrefix = dialPrefix;
    }

    public Integer getZoneId() {
        return zoneId;
    }

    public void setZoneId(Integer zoneId) {
        this.zoneId = zoneId;
    }

    public BigDecimal getPricePerVolume() {
        return pricePerVolume;
    }

    public void setPricePerVolume(BigDecimal pricePerVolume) {
        this.pricePerVolume = pricePerVolume;
    }

    public Long getUnitDeduction() {
        return unitDeduction;
    }

    public void setUnitDeduction(Long unitDeduction) {
        this.unitDeduction = unitDeduction;
    }

}