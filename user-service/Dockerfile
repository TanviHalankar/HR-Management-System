FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/user-service-0.0.1-SNAPSHOT.jar user-service.jar
EXPOSE 8101
ENTRYPOINT ["java","-jar","user-service.jar"]