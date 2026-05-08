package com.telecomsmart.model;

// tariff_zone:
// zone_id SERIAL PRIMARY KEY
// dial_prefix VARCHAR(10) NOT NULL
// zone_name VARCHAR(255) NOT NULL
// description TEXT
// distenation_name VARCHAR(255) NOT NULL


/* 

a class uned in the process of retriveing the zone id from the prefix dialB in the 

*/ 
public class TariffZone {

    private Integer zoneId;
    private String dialPrefix;
    private String zoneName;
    private String description;
    private String destinationName;
    

    public TariffZone() {
    }

    public TariffZone(Integer zoneId, String dialPrefix, String zoneName,
            String description, String destinationName) {
        this.zoneId = zoneId;
        this.dialPrefix = dialPrefix;
        this.zoneName = zoneName;
        this.description = description;
        this.destinationName = destinationName;
    }

    public Integer getZoneId() {
        return zoneId;
    }

    public void setZoneId(Integer zoneId) {
        this.zoneId = zoneId;
    }

    public String getDialPrefix() {
        return dialPrefix;
    }

    public void setDialPrefix(String dialPrefix) {
        this.dialPrefix = dialPrefix;
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    @Override
    public String toString() {
        return "TariffZone{"
                + "zoneId=" + zoneId
                + ", dialPrefix='" + dialPrefix + '\''
                + ", zoneName='" + zoneName + '\''
                + ", description='" + description + '\''
                + ", destinationName='" + destinationName + '\''
                + '}';
    }
}
