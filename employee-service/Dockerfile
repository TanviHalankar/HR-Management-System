FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/employee-service-0.0.1-SNAPSHOT.jar employee-service.jar
EXPOSE 8102
ENTRYPOINT ["java","-jar","employee-service.jar"]