#!/bin/bash

echo "========================================"
echo "🚀 Starting Telecom Billing Pipeline 🚀"
echo "========================================"

# Configuration
TOMCAT_DIR="/home/omar/apache-tomcat-11.0.20"
TOMCAT_URL="http://localhost:8080"
MAVEN_CMD="/home/omar/.maven/maven-3.9.14/bin/mvn"

# 1. Build and Deploy TelecomBillingWebsite WAR to Tomcat
echo "[0] Building and Deploying TelecomBillingWebsite WAR..."
cd /home/omar/windows/D/omar/Telecom_ITI/29-Billing-Mediation-Project/BillingProject/TelecomBillingSystem-NextGen/TelecomBillingWebsite
$MAVEN_CMD clean package -DskipTests -q
if [ $? -eq 0 ]; then
    cp target/TelecomBillingWebsite-1.0-SNAPSHOT.war "$TOMCAT_DIR/webapps/"
    echo "WAR deployed successfully to Tomcat"
else
    echo "ERROR: Failed to build WAR"
    exit 1
fi
cd ..

# Wait for Tomcat deployment
sleep 3

# 2. Start TelecomBillingWebsite Backend (already deployed to Tomcat)
echo "[1] TelecomBillingWebsite backend is deployed to Tomcat"

# 3. Start CDR Generator (Python)
echo "[2] Starting CDR Generator (Python)..."
cd parser_module
python3 generate_cdrs.py &
GEN_PID=$!
cd ..

# 4. Start the Java Telecom Billing Parser
echo "[3] Starting Telecom Billing Parser (Java)..."
cd parser_module
$MAVEN_CMD compile exec:java -Dexec.mainClass="com.mycompany.telecombillingparser.TelecomBillingParser" -q &
PARSER_PID=$!
cd ..

# 5. Start the Rating Engine
echo "[4] Starting Rating Engine (Java)..."
cd ratingEngine
$MAVEN_CMD compile exec:java -Dexec.mainClass="com.telecomsmart.ratingengine.RatingEngine" -q &
RATING_PID=$!
cd ..

# 6. Start Aggregation Engine
echo "[5] Starting Aggregation Engine (Java)..."
cd AggregationEngine
$MAVEN_CMD compile exec:java -Dexec.mainClass="com.mycompany.aggregationengine.AggregationEngine" -q &
AGGREGATION_PID=$!
cd ..

# 7. Start Frontend (Next.js)
echo "[6] Starting Frontend (Next.js)..."
cd frontend/telecom-next
npm run dev &
FRONTEND_PID=$!
cd ../..

echo "========================================"
echo "✅ All services are running!"
echo "   - Tomcat Backend: $TOMCAT_URL/TelecomBillingWebsite"
echo "   - Frontend: http://localhost:3000"
echo "Press [CTRL+C] to stop all services."
echo "========================================"

# Trap CTRL+C to gracefully kill all background processes
trap "echo -e '\n🛑 Stopping all services...'; kill $GEN_PID $PARSER_PID $RATING_PID $AGGREGATION_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT

# Keep the script running until manually terminated
wait
