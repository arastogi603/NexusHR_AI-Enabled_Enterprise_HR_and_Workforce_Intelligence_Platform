# syntax=docker/dockerfile:1.7
# Multi-stage production Dockerfile for NexusHR Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy module POMs explicitly to leverage Docker layer caching
COPY pom.xml pom.xml
COPY nexushr-common/pom.xml nexushr-common/pom.xml
COPY nexushr-auth/pom.xml nexushr-auth/pom.xml
COPY nexushr-employee/pom.xml nexushr-employee/pom.xml
COPY nexushr-payroll/pom.xml nexushr-payroll/pom.xml
COPY nexushr-performance/pom.xml nexushr-performance/pom.xml
COPY nexushr-analytics/pom.xml nexushr-analytics/pom.xml
COPY nexushr-notification/pom.xml nexushr-notification/pom.xml
COPY nexushr-gateway/pom.xml nexushr-gateway/pom.xml

# Copy complete source code
COPY . .

# Package executable runner JAR
RUN mvn -B -q -pl nexushr-gateway -am -DskipTests clean package

# Production lightweight Alpine runtime
FROM eclipse-temurin:17-jre-alpine

# Non-root unprivileged service account
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

# Copy artifact from build stage
COPY --from=build /workspace/nexushr-gateway/target/nexushr-gateway-*.jar app.jar
RUN chown -R app:app /app

USER app
EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -Dspring.threads.virtual.enabled=true"
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
