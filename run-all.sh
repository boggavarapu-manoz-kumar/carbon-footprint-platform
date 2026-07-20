#!/bin/bash
echo "Starting Backend (Spring Boot)..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

echo "Starting Frontend (React/Vite)..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Starting Admin Frontend (React/Vite)..."
cd admin-frontend
npm install
npm run dev &
ADMIN_PID=$!
cd ..

echo "All services started."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Admin Frontend PID: $ADMIN_PID"
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID" EXIT

wait
