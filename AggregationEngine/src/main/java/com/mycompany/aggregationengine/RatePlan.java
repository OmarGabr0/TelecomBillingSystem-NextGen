/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

/**
 *
 * @author mohamed
 */
public class RatePlan {
    public int id;
    public String name;
    public int free_units;
    public ServicePackages servicePackages;
    public double ror_policy;
    public double price;

    public RatePlan(int id, String name, int free_units,ServicePackages servicePackages, double ror_policy, double price) {
        this.id = id;
        this.name = name;
        this.free_units = free_units;
        this.servicePackages = servicePackages;
        this.ror_policy = ror_policy;
        this.price = price;
    }
    
}
