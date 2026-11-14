FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml ./
COPY src/ src/
RUN mvn -B -q -DskipTests package
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -r -u 10001 appuser
COPY --from=build /build/target/policy-service-0.1.0.jar app.jar
USER appuser
EXPOSE 8082
CMD ["java", "-jar", "app.jar"]
