FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .

RUN mvn -pl news-service -am -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/news-service/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
