//ZoneResolver.java: Takes dialB, checks the TreeMap, and returns the zone_id.
package com.telecomsmart.ratingengine;

import com.telecomsmart.dao.TarrifZoneDao;
import com.telecomsmart.dao.ZonePriceDao;
import com.telecomsmart.model.CdrRecord;
import com.telecomsmart.model.CustomerProfile;
import com.telecomsmart.model.TariffZone;
import com.telecomsmart.model.ZonePrice;
import java.math.BigDecimal;
import java.util.Map;

public class ZoneResolver {
    private final TarrifZoneDao tariffZoneDao = new TarrifZoneDao();
    private final ZonePriceDao zonePriceDao = new ZonePriceDao();

    // 🔹 IN-MEMORY CACHES
    private final Map<String, TariffZone> zoneMappingCache;
    private final Map<String, Map<Integer, ZonePrice>> zonePricesCache;

    public ZoneResolver() {
        // Load data into memory ONCE during initialization
        this.zoneMappingCache = tariffZoneDao.getZoneMaping();
        this.zonePricesCache = zonePriceDao.getAllZonePrices();
        System.out.println(">>> [ZoneResolver] Cached Zones & Prices in Memory successfully!");
    }

    public ZonePrice resolveZonePrice(Integer ratePlanId, Integer servicePackageId, CdrRecord cdr) {
        if (ratePlanId == null || servicePackageId == null || cdr == null) {
            return null;
        }

        // data case
        if (cdr.getServiceId() == 3) {
            return ZonePrice.forData();
        }

        // 🔹 Read from Memory Cache instead of hitting DB
        Integer zoneId = resolveZoneId(cdr.getDialB(), this.zoneMappingCache);
        if (zoneId == null) {
            return null;
        }

        String cacheKey = ratePlanId + "_" + servicePackageId;
        Map<Integer, ZonePrice> zonePrices = this.zonePricesCache.get(cacheKey);

        if (zonePrices != null) {
            return zonePrices.get(zoneId);
        }
        
        return null;
    }

    public BigDecimal calculateCharge(Integer ratePlanId, Integer serviceId, CdrRecord cdr, CustomerProfile customer) {
        if (cdr == null) return BigDecimal.ZERO;

        ZonePrice zonePrice = resolveZonePrice(ratePlanId, serviceId, cdr);

        if (zonePrice == null || zonePrice.getPricePerVolume() == null) {
            return BigDecimal.ZERO;
        }

        return zonePrice.getPricePerVolume().multiply(BigDecimal.valueOf(cdr.getDurationVolume()));
    }

    private Integer resolveZoneId(String dialB, Map<String, TariffZone> zoneMapping) {
        if (dialB == null) return null;

        String normalized = dialB.replaceAll("[^0-9]", "");

        for (Map.Entry<String, TariffZone> entry : zoneMapping.entrySet()) {
            if (normalized.startsWith(entry.getKey())) {
                return entry.getValue().getZoneId();
            }
        }
        return null;
    }
}