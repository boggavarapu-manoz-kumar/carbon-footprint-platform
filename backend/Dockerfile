# Multi-Stage Production Dockerfile for Carbon Footprint Platform Backend (Spring Boot 3 / Java 21)

# Stage 1: Build & Package
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for container health checks
RUN apk add --no-cache curl tzdata && \
    addgroup -S spring && adduser -S spring -G spring

# Copy jar from build stage
COPY --from=builder /build/target/*.jar app.jar
RUN chown -R spring:spring /app

USER spring:spring

# Environment defaults
ENV PORT=8081 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
