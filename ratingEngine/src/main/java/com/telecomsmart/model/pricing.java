package com.telecomsmart.model;

import java.math.BigDecimal;

// a class that will have all the pricing infos of the user 
// at the end of rating process 
public class pricing { 
    
    private String msisdn;
    private BigDecimal ror;
    private long freeDataUnits;
    private long freeVoiceUnits;
    private long freeSmsUnits;

    public pricing() {
    }

    public pricing(String msisdn, BigDecimal ror, long freeDataUnits, long freeVoiceUnits, long freeSmsUnits) {
        this.msisdn = msisdn;
        this.ror = ror;
        this.freeDataUnits = freeDataUnits;
        this.freeVoiceUnits = freeVoiceUnits;
        this.freeSmsUnits = freeSmsUnits;
    }

    public String getMsisdn() {
        return msisdn;
    }

    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }

    public BigDecimal getRor() {
        return ror;
    }

    public void setRor(BigDecimal ror) {
        this.ror = ror;
    }

    public long getFreeDataUnits() {
        return freeDataUnits;
    }

    public void setFreeDataUnits(long freeDataUnits) {
        this.freeDataUnits = freeDataUnits;
    }

    public long getFreeVoiceUnits() {
        return freeVoiceUnits;
    }

    public void setFreeVoiceUnits(long freeVoiceUnits) {
        this.freeVoiceUnits = freeVoiceUnits;
    }

    public long getFreeSmsUnits() {
        return freeSmsUnits;
    }

    public void setFreeSmsUnits(long freeSmsUnits) {
        this.freeSmsUnits = freeSmsUnits;
    }
}