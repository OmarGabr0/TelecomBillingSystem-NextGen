import random
import datetime
import os
import time

my_numbers = [
    "00201619283745", "00201650394821", "00201684759203", "00201628374619", "00201693847562",
    "00201648592031", "00201660495837", "00201639485762", "00201682736450", "00201610293847",
    "00201657483920", "00201691827364", "00201645372819", "00201623948576", "00201687162534",
    "00201634592817", "00201678192034", "00201656273849", "00201690485721", "00201627384950"
]

urls = ["http://www.google.com", "http://www.facebook.com", "http://www.youtube.com", "http://www.whatsapp.com"]
external_prefixes = ["002010", "002011", "002012", "002015"]

script_dir = os.path.dirname(os.path.abspath(__file__))

target_dir = os.path.join(script_dir, "generated_cdrs")

os.makedirs(target_dir, exist_ok=True)
print("CDR Generator Started... Press CTRL+C to stop.")



while True:
    
    file_time = datetime.datetime.now()
    filename = os.path.join(target_dir, f"CDR{file_time.strftime('%Y%m%d%H%M%S')}.csv")

    with open(filename, 'w') as f:
        for _ in range(100):
            dial_a = random.choice(my_numbers)
            service_id = random.choice([1, 2, 3])
            
            # Start time formatting
            record_time = file_time + datetime.timedelta(minutes=random.randint(0, 59), seconds=random.randint(0, 59))
            start_time_str = record_time.strftime("%H:%M:%S")
            
            if service_id == 1: # Voice
                is_external = random.choice([True, False])
                if is_external:
                    dial_b = random.choice(external_prefixes) + str(random.randint(1000000, 9999999))
                    ext_fees = random.randint(10, 50)
                else:
                    dial_b = random.choice([n for n in my_numbers if n != dial_a])
                    ext_fees = 0
                duration = random.randint(10, 600)
                f.write(f"{dial_a},{dial_b},{service_id},{duration},{start_time_str},{ext_fees}\n")
                
            elif service_id == 2: # SMS
                is_external = random.choice([True, False])
                if is_external:
                    dial_b = random.choice(external_prefixes) + str(random.randint(1000000, 9999999))
                    ext_fees = random.choice([10, 20])
                else:
                    dial_b = random.choice([n for n in my_numbers if n != dial_a])
                    ext_fees = 0
                messages = random.randint(1, 5)
                f.write(f"{dial_a},{dial_b},{service_id},{messages},{start_time_str},{ext_fees}\n")
                
            else: # Data
                dial_b = random.choice(urls)
                volume = random.randint(1024, 104857600) # From 1KB to 100MB
                ext_fees = random.choice([0, 10, 15])
                f.write(f"{dial_a},{dial_b},{service_id},{volume},{start_time_str},{ext_fees}\n")
    
    print(f"Generated new batch of 100 CDRs: {filename}")
    time.sleep(5)
