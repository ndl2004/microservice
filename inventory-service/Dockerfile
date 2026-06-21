FROM eclipse-temurin:21-jre

WORKDIR /app

COPY inventory-service/target/inventory-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]