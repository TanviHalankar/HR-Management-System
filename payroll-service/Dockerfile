FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/payroll-service-0.0.1-SNAPSHOT.jar payroll.jar
EXPOSE 8103
ENTRYPOINT ["java","-jar","payroll.jar"]