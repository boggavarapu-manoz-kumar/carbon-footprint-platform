#!/bin/bash
# Load environment variables from .env file
set -a
source "$(dirname "$0")/.env"
set +a

echo "✅ Environment loaded"
echo "🚀 Starting Carbon Footprint Platform Backend..."
mvn spring-boot:run
