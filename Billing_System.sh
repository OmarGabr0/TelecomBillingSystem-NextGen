#!/bin/bash

echo "========================================"
echo "🚀 Starting Telecom Billing Pipeline 🚀"
echo "========================================"

# 1. Navigate to the parser directory and start the Python generator
echo "[1] Starting CDR Generator (Python)..."
cd parser_module
python3 "import random.py" &
GEN_PID=$!

# 2. Start the Java Telecom Billing Parser using Maven
echo "[2] Starting Telecom Billing Parser (Java)..."
mvn compile exec:java -Dexec.mainClass="com.mycompany.telecombillingparser.TelecomBillingParser" &
PARSER_PID=$!

# Return to the root directory
cd ..

# 3. Navigate to the Rating Engine directory and start it using Maven
echo "[3] Starting Rating Engine (Java)..."
cd ratingEngine
mvn compile exec:java -Dexec.mainClass="com.telecomsmart.ratingengine.RatingEngine" &
RATING_PID=$!

# Return to the root directory
cd ..

echo "========================================"
echo "✅ All services are running in the background!"
echo "Press [CTRL+C] to stop all services."
echo "========================================"

# Trap CTRL+C to gracefully kill all background processes
trap "echo -e '\n🛑 Stopping all services...'; kill $GEN_PID $PARSER_PID $RATING_PID; exit" SIGINT

# Keep the script running until manually terminated
wait
