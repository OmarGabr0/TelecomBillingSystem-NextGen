/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

import java.sql.Date;

/**
 *
 * @author mohamed
 */
public class Profile {
    public String msisdn;
    public int rate_plan_id;
    public int data_units;
    public int voice_units;
    public int sms_units;
    public int free_units;
    public Date billing_start;
    public Date billing_end;
    public double discount;
    public double ror;

    public Profile(String msisdn, int rate_plan_id, int data_units, int voice_units, int sms_units, int free_units, Date billing_start, Date billing_end,double discount,double ror) {
        this.msisdn = msisdn;
        this.rate_plan_id = rate_plan_id;
        this.data_units = data_units;
        this.voice_units = voice_units;
        this.sms_units = sms_units;
        this.free_units = free_units;
        this.billing_start = billing_start;
        this.billing_end = billing_end;
        this.discount=discount;
        this.ror = ror;
    }
    
}
