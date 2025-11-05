FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/employee-service-0.0.1-SNAPSHOT.jar employee-service.jar
EXPOSE 8102
ENTRYPOINT ["java","-jar","employee-service.jar"]