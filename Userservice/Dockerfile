 # Use a stable, lightweight JDK 17 image
FROM eclipse-temurin:17-jdk-alpine

# Set environment variables
#ENV APP_HOME=/app
WORKDIR /app

# Copy the built JAR file into the image
COPY target/*.jar app.jar

# Expose the port your Spring Boot app listens on
EXPOSE 8080

# Default ENTRYPOINT (fixed command)
ENTRYPOINT ["java", "-jar", "app.jar"]

# Default CMD arguments (can be overridden at runtime)
CMD ["--spring.profiles.active=prod"]