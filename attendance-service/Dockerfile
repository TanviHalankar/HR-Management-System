FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/attendance-service-0.0.1-SNAPSHOT.jar attendance-service.jar
EXPOSE 8104
ENTRYPOINT ["java", "-jar", "attendance-service.jar"]
