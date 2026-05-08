package com.telecomsmart.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 *
 * @author omar
 */
public class CdrRecord {

    private int cdrId;
    private String msisdn;
    private String dialB;
    private int serviceId;
    private long durationVolume;
    private BigDecimal externalFeesAmount;
    private LocalDateTime cdrTimestamp;

    public CdrRecord() {

    }

    public CdrRecord(int cdrId, String msisdn, String dialB,
            int serviceId, long durationVolume,
            BigDecimal externalFeesAmount, LocalDateTime cdrTimestamp) {
        this.cdrId = cdrId;
        this.msisdn = msisdn;
        this.dialB = dialB;
        this.serviceId = serviceId;
        this.durationVolume = durationVolume;
        this.externalFeesAmount = externalFeesAmount;
        this.cdrTimestamp = cdrTimestamp;
    }

    public int getCdrId() {
        return cdrId;
    }

    public void setCdrId(int cdrId) {
        this.cdrId = cdrId;
    }

    public String getMsisdn() {
        return msisdn;
    }

    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }

    public String getDialB() {
        return dialB;
    }

    public void setDialB(String dialB) {
        this.dialB = dialB;
    }

    public int getServiceId() {
        return serviceId;
    }

    public void setServiceId(int serviceId) {
        this.serviceId = serviceId;
    }

    public long getDurationVolume() {
        return durationVolume;
    }

    public void setDurationVolume(long durationVolume) {
        this.durationVolume = durationVolume;
    }

    public BigDecimal getExternalFeesAmount() {
        return externalFeesAmount;
    }

    public void setExternalFeesAmount(BigDecimal externalFeesAmount) {
        this.externalFeesAmount = externalFeesAmount;
    }

    public LocalDateTime getCdrTimestamp() {
        return cdrTimestamp;
    }

    public void setCdrTimestamp(LocalDateTime cdrTimestamp) {
        this.cdrTimestamp = cdrTimestamp;
    }

    // 🔹 for debugging 
    @Override
    public String toString() {
        return "CDR{"
                + "cdrId=" + cdrId
                + ", msisdn='" + msisdn + '\''
                + ", dialB='" + dialB + '\''
                + ", serviceId=" + serviceId
                + ", durationVolume=" + durationVolume
                + ", externalFeesAmount=" + externalFeesAmount
                + ", cdrTimestamp=" + cdrTimestamp
                + '}';
    }
}
