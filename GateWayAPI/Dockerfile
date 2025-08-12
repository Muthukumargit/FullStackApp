# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the full source code
COPY src ./src

# Build the project
RUN mvn clean install -DskipTests

# Stage 2: Run the application using lightweight JDK
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# ✅ FIX: Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 20000

ENTRYPOINT ["java", "-jar", "app.jar"]

CMD ["--spring.profiles.active=prod"]