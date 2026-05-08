package com.telecomsmart.model;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Maps to {@code customer_profile} (see {@code Billing.sql}).
 *
 * @author omar
 */
public class CustomerProfile {

    // CREATE TABLE IF NOT EXISTS customer_profile (
    //     msisdn VARCHAR(15) NOT NULL REFERENCES contract (msisdn) ON DELETE CASCADE,
    //     credit_limit INT NOT NULL,
    //     ror_usage DECIMAL(10, 2) NOT NULL,
    //     rateplan_id INT NOT NULL REFERENCES rateplan (rateplan_id) ON DELETE CASCADE,
    //     free_data_units BIGINT NOT NULL,
    //     free_voice_units BIGINT NOT NULL,
    //     free_sms_units BIGINT NOT NULL
    // );
    // //columns in database: 



    private String msisdn;
    private Integer creditLimit;
    private BigDecimal rorUsage;
    private Integer ratePlanId;
    private long dataUnits;
    private long voiceUnits;
    private long smsUnits;
    private long freeUnits;

    public CustomerProfile() {
    }

    public CustomerProfile(String msisdn, Integer creditLimit, BigDecimal rorUsage,
            Integer ratePlanId, long freedataUnits, long freeVoiceUnits, long freeSmsUnits) {
        this.msisdn = msisdn;
        this.creditLimit = creditLimit;
        this.rorUsage = rorUsage;
        this.ratePlanId = ratePlanId;
        this.freeUnits = freeUnits;
        this.dataUnits = dataUnits;
        this.voiceUnits = voiceUnits;
        this.smsUnits = smsUnits;
    }

    public String getMsisdn() {
        return msisdn;
    }

    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }

    public Integer getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Integer creditLimit) {
        this.creditLimit = creditLimit;
    }

    public BigDecimal getRorUsage() {
        return rorUsage;
    }

    public void setRorUsage(BigDecimal rorUsage) {
        this.rorUsage = rorUsage;
    }

    public Integer getRatePlanId() {
        return ratePlanId;
    }

    public void setRatePlanId(Integer ratePlanId) {
        this.ratePlanId = ratePlanId;
    }
    ////
    public long getFreeUnits() {
        return freeUnits;
    }

    public void setFreeUnits(long freeUnits) {
        this.freeUnits = freeUnits;
    }
    /////
    public long getDataUnits() {
        return dataUnits;
    }

    public void setDataUnits(long dataUnits) {
        this.dataUnits = dataUnits;
    }

    public long getVoiceUnits() {
        return voiceUnits;
    }

    public void setVoiceUnits(long voiceUnits) {
        this.voiceUnits = voiceUnits;
    }

    public long getSmsUnits() {
        return smsUnits;
    }

    public void setSmsUnits(long smsUnits) {
        this.smsUnits = smsUnits;
    }
/*
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        CustomerProfile that = (CustomerProfile) o;
        return Objects.equals(msisdn, that.msisdn);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(msisdn);
    }
*/
    @Override
    public String toString() {
        return "CustomerProfile{"
                + "msisdn='" + msisdn + '\''
                + ", creditLimit=" + creditLimit
                + ", rorUsage=" + rorUsage
                + ", ratePlanId=" + ratePlanId
                + ", freeUnits=" + freeUnits
                + ", dataUnits=" + dataUnits
                + ", voiceUnits=" + voiceUnits
                + ", smsUnits=" + smsUnits
                + ", UnitsRemaining=" + getFreeUnits()
                + '}';
    }
}
