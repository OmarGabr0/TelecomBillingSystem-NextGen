package com.telecomsmart.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class RatedCdr {

    private long ratedCdrId;
    private long cdrId;
    private String cdrStatus;
    private Timestamp processedAt;

    private String msisdn;
    private long roundedDuration;
    private BigDecimal rorUsage;
    private long unitsUsage;
    private int serviceId;

    public RatedCdr() {}

    public long getRatedCdrId() {
        return ratedCdrId;
    }

    public void setRatedCdrId(long ratedCdrId) {
        this.ratedCdrId = ratedCdrId;
    }

    public long getCdrId() {
        return cdrId;
    }

    public void setCdrId(long cdrId) {
        this.cdrId = cdrId;
    }

    public String getCdrStatus() {
        return cdrStatus;
    }

    public void setCdrStatus(String cdrStatus) {
        this.cdrStatus = cdrStatus;
    }

    public Timestamp getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Timestamp processedAt) {
        this.processedAt = processedAt;
    }

    public String getMsisdn() {
        return msisdn;
    }

    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }

    public long getRoundedDuration() {
        return roundedDuration;
    }

    public void setRoundedDuration(long roundedDuration) {
        this.roundedDuration = roundedDuration;
    }

    public BigDecimal getRorUsage() {
        return rorUsage;
    }

    public void setRorUsage(BigDecimal rorUsage) {
        this.rorUsage = rorUsage;
    }

    public long getUnitsUsage() {
        return unitsUsage;
    }

    public void setUnitsUsage(long unitsUsage) {
        this.unitsUsage = unitsUsage;
    }

    public int getServiceId() {
        return serviceId;
    }

    public void setServiceId(int serviceId) {
        this.serviceId = serviceId;
    }
}