FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/eureka-server-0.0.1-SNAPSHOT.jar eureka.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","eureka.jar"]