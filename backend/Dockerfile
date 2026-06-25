# Use official Maven image to build the app
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Use lightweight JDK image for runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Expose port
EXPOSE 8080

# Create uploads directory (to be mounted to a persistent disk)
RUN mkdir -p /data/uploads
VOLUME /data

# Copy jar
COPY --from=build /app/target/policyai-backend-1.0.0.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
