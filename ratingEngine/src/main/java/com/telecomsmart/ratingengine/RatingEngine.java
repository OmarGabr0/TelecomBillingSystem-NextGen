// RatingEngine.java: The orchestrator. It loops through CDRs, calls the Resolver and Processor, and creates a RatedCdr result.
package com.telecomsmart.ratingengine;

import com.telecomsmart.model.*;
import com.telecomsmart.services.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import com.telecomsmart.dao.*;

/**
 *
 * @author omar
 */
public class RatingEngine {
    private long bytesToMB(long bytes) {
        return (bytes + (1024 * 1024 - 1)) / (1024 * 1024);
    }

    private long secondsToMinutes(long seconds) {
        return (seconds + 59) / 60;
    }

    public static void main(String[] args) {
        RatingEngine ratingEngine = new RatingEngine();

        // 🔹 1. LOAD STATIC DATA OUTSIDE THE LOOP (Run only once to prevent N+1 queries)
        ServicePackageDao servicePackageDao = new ServicePackageDao();
        Map<String, Integer> servicePackageCache = servicePackageDao.getAllServicePackages();
        
        // The ZoneResolver constructor now caches zones and prices in memory automatically
        ZoneResolver zoneResolver = new ZoneResolver(); 
        
        CustomerProfileDao customerProfileDao = new CustomerProfileDao();

        while (true) {
            // 🔹 2. LOAD DYNAMIC DATA INSIDE THE LOOP (Because balances change constantly)
            // Get all customers profiles in memory
            Map<String, CustomerProfile> Customers = customerProfileDao.getCustomerProfiles();
            
            // Assume we have the cdr from cdr filter
            List<CdrRecord> cdrs = CdrHandling.getCdrs();

            if (cdrs.isEmpty()) {
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } 
                continue;
            }

            // Create a list to collect customers that need to be updated in the DB
            List<CustomerProfile> customersToUpdate = new ArrayList<>();
            System.out.println(">>> [Rating Engine] Fetched " + cdrs.size() + " CDRs from DB to process...");

            // Looping in the cdrs
            for (CdrRecord cdr : cdrs) {
                String cdrMsisdn = cdr.getMsisdn();
                // Get the customer for that CDR
                CustomerProfile customer = Customers.get(cdrMsisdn);

                if (customer != null) {
                    // 🔹 3. Get service package from Memory Cache instead of hitting the DB
                    String spKey = customer.getRatePlanId() + "_" + cdr.getServiceId();
                    Integer servicePackageId = servicePackageCache.get(spKey);
                    
                    if (servicePackageId == null) {
                        System.out.println("No service package found for msisdn: " + cdrMsisdn);
                        continue; // Skip this CDR
                    }
                    
                    // Get zone price (ZoneResolver now reads from its internal memory cache)
                    ZonePrice pricedZone = zoneResolver.resolveZonePrice(customer.getRatePlanId(), servicePackageId, cdr);
                    if (pricedZone == null) {
                        System.out.println("No pricing found for CDR: " + cdr.getCdrId());
                        continue;
                    }

                    // RLH: Service ID switch case
                    switch (cdr.getServiceId()) {
                        // Logic for Case 1: VOICE (Applying 3-Tier Hierarchy)
                        case 1: // VOICE
                            long seconds = cdr.getDurationVolume();
                            long minutes = (long) Math.ceil(seconds / 60.0);
                            long remainingToCharge = minutes;

                            // STEP 1: Deduct from General Free Units
                            if (customer.getFreeUnits() > 0) {
                                if (customer.getFreeUnits() >= remainingToCharge) {
                                    customer.setFreeUnits(customer.getFreeUnits() - remainingToCharge);
                                    remainingToCharge = 0;
                                } else {
                                    remainingToCharge -= customer.getFreeUnits();
                                    customer.setFreeUnits(0L);
                                }
                            }

                            // STEP 2: Deduct from Voice Specific Units
                            if (remainingToCharge > 0 && customer.getVoiceUnits() > 0) {
                                if (customer.getVoiceUnits() >= remainingToCharge) {
                                    customer.setVoiceUnits(customer.getVoiceUnits() - remainingToCharge);
                                    remainingToCharge = 0;
                                } else {
                                    remainingToCharge -= customer.getVoiceUnits();
                                    customer.setVoiceUnits(0L);
                                }
                            }

                            // STEP 3: Charge to ROR (Money)
                            if (remainingToCharge > 0) {
                                BigDecimal charge = pricedZone.getPricePerVolume().multiply(BigDecimal.valueOf(remainingToCharge));
                                customer.setRorUsage(customer.getRorUsage().add(charge));
                            }
                            break;

                        case 2: // SMS
                            long smsCount = cdr.getDurationVolume();
                            long deduction = pricedZone.getUnitDeduction() * smsCount;

                            if (customer.getSmsUnits() > 0) {
                                long remainingSms = customer.getSmsUnits() - deduction;

                                if (remainingSms >= 0) {
                                    // Sufficient SMS units available
                                    customer.setSmsUnits(remainingSms);
                                } else {
                                    // Partial consumption: SMS units exhausted, charge the remaining messages
                                    long chargeableSms = Math.abs(remainingSms) / pricedZone.getUnitDeduction();
                                    BigDecimal charge = pricedZone.getPricePerVolume().multiply(BigDecimal.valueOf(chargeableSms));
                                    customer.setSmsUnits(0L);
                                    customer.setRorUsage(customer.getRorUsage().add(charge));
                                }
                            } else {
                                // No SMS units available, charge the full count
                                BigDecimal charge = pricedZone.getPricePerVolume().multiply(BigDecimal.valueOf(smsCount));
                                customer.setRorUsage(customer.getRorUsage().add(charge));
                            }
                            break;
                          
                        case 3: // DATA
                            long usageMB = ratingEngine.bytesToMB(cdr.getDurationVolume());

                            if (customer.getDataUnits() > 0) {
                                long remainingUnits = customer.getDataUnits() - usageMB;

                                if (remainingUnits >= 0) {
                                    customer.setDataUnits(remainingUnits);
                                } else {
                                    // Partial consumption
                                    long chargeableMB = Math.abs(remainingUnits);
                                    BigDecimal charge = pricedZone.getPricePerVolume().multiply(BigDecimal.valueOf(chargeableMB));
                                    customer.setDataUnits(0L);
                                    customer.setRorUsage(customer.getRorUsage().add(charge));
                                }
                            } else {
                                BigDecimal charge = pricedZone.getPricePerVolume().multiply(BigDecimal.valueOf(usageMB));
                                customer.setRorUsage(customer.getRorUsage().add(charge));
                            }
                            break;

                        default:
                            System.out.println("Unknown service");
                    }

                    // Add external fees from the CDR to the customer's ROR
//                    if (cdr.getExternalFeesAmount() != null && cdr.getExternalFeesAmount().compareTo(BigDecimal.ZERO) > 0) {
//                        customer.setRorUsage(customer.getRorUsage().add(cdr.getExternalFeesAmount()));
//                    }

                    // Add customer to the batch list instead of updating the DB immediately
                    // Using contains() ensures we don't add duplicate update queries for the same customer in one batch
                    if (!customersToUpdate.contains(customer)) {
                        customersToUpdate.add(customer);
                    }

                    // Credit limit logic can go here

                } else {
                    // System.out.println("No match for: " + cdr.getMsisdn());
                }
            }

            // 4. Execute Batch Update after processing all CDRs in the current batch
            if (!customersToUpdate.isEmpty()) {
                boolean isBatchUpdated = customerProfileDao.updateCustomerProfilesBatch(customersToUpdate);
                if (isBatchUpdated) {
                    System.out.println("✅ Successfully rated and batch-updated " + customersToUpdate.size() + " unique customers!");
                } else {
                    System.out.println("❌ Failed to process batch update.");
                }
            }

        }
    }
}