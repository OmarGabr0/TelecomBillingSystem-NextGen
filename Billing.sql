--- postgresql 
------------------

CREATE TABLE IF NOT EXISTS customer (
 customer_id SERIAL PRIMARY KEY, 
 email VARCHAR(255) NOT NULL UNIQUE, 
 name VARCHAR(255) NOT NULL, 
 address VARCHAR(255) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE IF NOT EXISTS rateplan (
    rateplan_id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL, 
    --ROR DECIMAL(10, 2) NOT NULL,
    description TEXT,
    free_units BIGINT NOT NULL,
    plan_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS tariff_zone (
zone_id SERIAL PRIMARY KEY,
dial_prefix VARCHAR(10) NOT NULL, --- 3 chars = 010 ,011,012
zone_name VARCHAR(255) NOT NULL,
description TEXT,
distenation_name VARCHAR(255) NOT NULL

);


CREATE TABLE IF NOT EXISTS contract (
    msisdn VARCHAR(15) PRIMARY KEY, 
    contract_name VARCHAR(255) NOT NULL,
    credit_limit INT NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    customer_id INT NOT NULL REFERENCES customer (customer_id) ON DELETE CASCADE,
    rateplan_id INT NOT NULL REFERENCES rateplan (rateplan_id), 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_service (
    recurring_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    bill_cycle VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS onetime_fee (
    fee_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    date_apply DATE NOT NULL
);


CREATE TABLE IF NOT EXISTS contract_recurring (
    msisdn VARCHAR(15) NOT NULL REFERENCES contract(msisdn) ON DELETE CASCADE,
    recurring_id INT NOT NULL REFERENCES recurring_service(recurring_id) ON DELETE RESTRICT,

    PRIMARY KEY (msisdn, recurring_id)
);



--- junction tables for many to many relationship between contract and recurring_service, onetime_fee

CREATE TABLE IF NOT EXISTS contract_fee (
    msisdn VARCHAR(15) NOT NULL REFERENCES contract(msisdn) ON DELETE CASCADE,
    fee_id INT NOT NULL REFERENCES onetime_fee(fee_id) ON DELETE RESTRICT,

    PRIMARY KEY (msisdn, fee_id)
);
----------------------------------

CREATE TABLE  IF NOT EXISTS  service_package (
    service_id SERIAL PRIMARY KEY, 
    service_type INT NOT NULL, --- 1=voice, 2=sms, 3=data
    description TEXT,
    --- conversion model is delayed for now
    rating_price DECIMAL(10, 2) NOT NULL, --- = the ROR price
    units BIGINT NOT NULL, -- units for the service = for data or voice or sms 
    zone_id INT NOT NULL REFERENCES tariff_zone(zone_id)
    
);

CREATE TABLE IF NOT EXISTS service_rateplan (
    service_id INT NOT NULL REFERENCES service_package (service_id) ON DELETE CASCADE, 
    rateplan_id INT NOT NULL REFERENCES rateplan (rateplan_id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, rateplan_id)
);


---- billing and invoices 
CREATE TABLE IF NOT EXISTS bill (
    bill_id SERIAL PRIMARY KEY, 
    msisdn VARCHAR(15) NOT NULL REFERENCES contract (msisdn) ON DELETE CASCADE, 
    total_free_units BIGINT NOT NULL,
    total_onetime_fee DECIMAL(10, 2) NOT NULL,
    total_recurring DECIMAL(10, 2) NOT NULL,
    total_usage DECIMAL(10, 2) NOT NULL,
    taxes DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    bill_date DATE NOT NULL,
    bill_status VARCHAR(20) NOT NULL --- paid,unpaid,overdue
    
);

CREATE TABLE IF NOT EXISTS invoice (
    invoice_id SERIAL PRIMARY KEY, 
    bill_id INT NOT NULL REFERENCES bill(bill_id) ON DELETE CASCADE, 
    pdf_path VARCHAR(255) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL,
    generated_at DATE NOT NULL,
    invoice_status VARCHAR(20) NOT NULL --- paid,unpaid,overdue
);
--- cdr depend on the msisdn as fk 
CREATE TABLE IF NOT EXISTS cdr (
    cdr_id SERIAL PRIMARY KEY , 
    msisdn VARCHAR(15) NOT NULL REFERENCES contract (msisdn),
    dial_a TEXT NOT NULL,
    dial_b TEXT NOT NULL,
    service_id INT NOT NULL,
    duration_volume  BIGINT NOT NULL,
    external_fees_amount DECIMAL(10, 2) NOT NULL,
    cdr_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);
--- rated cdr after rating 
CREATE TABLE IF NOT EXISTS rated_cdr (
msisdn VARCHAR(15) NOT NULL REFERENCES contract (msisdn) ON DELETE CASCADE,
rated_cdr_id SERIAL PRIMARY KEY,
cdr_id INT NOT NULL REFERENCES cdr(cdr_id) ON DELETE CASCADE,
cdr_status VARCHAR(5) NOT NULL, --- rated,processing,corrupted
processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);



------ Table for Rating Engine tracking the customer profiles ---- 
CREATE TABLE IF NOT EXISTS customer_profile (
    msisdn VARCHAR(15) NOT NULL REFERENCES contract (msisdn) ON DELETE CASCADE,
    --contract_name VARCHAR(255) NOT NULL,
    credit_limit INT NOT NULL,
    ror_usage DECIMAL(10, 2) NOT NULL,
    --deleted credit limit , not used 
--info: rateplan_id
rateplan_id INT NOT NULL REFERENCES rateplan (rateplan_id) ON DELETE CASCADE,
voice_units BIGINT NOT NULL,
data_units BIGINT NOT NULL,
sms_units BIGINT NOT NULL,
free_units BIGINT NOT NULL
);

----- adding a link between the rateplan and tarrif zone for better rating and billing
CREATE TABLE IF NOT EXISTS rateplan_service_zone (
    id SERIAL PRIMARY KEY,
    rateplan_id INT NOT NULL REFERENCES rateplan(rateplan_id) ON DELETE CASCADE,
    service_package_id INT NOT NULL REFERENCES service_package(service_id) ON DELETE CASCADE,
    zone_id INT NOT NULL REFERENCES tariff_zone(zone_id) ON DELETE CASCADE,

    price_per_volume DECIMAL(10,2) NOT NULL,
    unit_deduction BIGINT DEFAULT 0
);


