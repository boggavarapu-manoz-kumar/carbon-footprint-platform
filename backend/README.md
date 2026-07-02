# Carbon Footprint Platform - Backend API

Welcome to the backend API for the **Carbon Footprint Platform**. This is a Spring Boot application designed to monitor, track, and calculate carbon emissions across various activities like transport, diet, and energy usage. 

## 🚀 Features
- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens).
- **Activity Logging:** Track daily activities and calculate carbon emissions based on dynamically updated emission factors.
- **Emission Factors Management:** Admins can configure the multipliers used to calculate carbon footprints for different activities.
- **Bulk Import:** Users can upload or submit bulk activity logs in a single request.
- **Dynamic Search & Filtering:** Filter activities by category or date ranges.

---

## 🛠️ Tech Stack
- **Java 21+**
- **Spring Boot 3.2.x** (Web, Data JPA, Security, Validation)
- **MySQL 8** (Database)
- **Lombok** (Code reduction)
- **Maven** (Build tool)
- **JJWT** (For secure token management)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Java Development Kit (JDK) 21 or higher](https://jdk.java.net/) *(This project was built and tested with Java 25).*
- [Apache Maven](https://maven.apache.org/)
- [MySQL Server & MySQL Workbench](https://dev.mysql.com/downloads/)

---

## 🗄️ Database Setup

1. Open your **MySQL Workbench** or terminal.
2. Connect to your local MySQL instance (usually `localhost:3306`).
3. Create the database for the application by running the following SQL query:
   ```sql
   CREATE DATABASE carbon_db;
   ```
4. **Note on Credentials:** The application is configured to connect to MySQL using the username `root` with **no password** (a blank password). If your MySQL server requires a password, please update the `src/main/resources/application.yml` file:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/carbon_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
       username: root
       password: your_password_here
   ```

*(Because the app uses Hibernate `ddl-auto: update`, all your database tables will be created automatically the first time you run the app!)*

---

## ▶️ How to Run the Application

1. Open a terminal and navigate to the root directory of this project (where the `pom.xml` is located).
2. Clean the project and start the Spring Boot server using Maven:
   ```bash
   mvn clean spring-boot:run
   ```
3. The server will start on port `8081`. 
4. **Data Seeding:** On startup, the application will automatically seed 6 default emission factors into your database so you can start testing immediately.

---

## 🧪 API Endpoints Overview

The base URL for the API is `http://localhost:8081`.

- **Auth:** `POST /api/v1/auth/register`, `POST /api/v1/auth/authenticate`
- **Users:** `GET /api/v1/users`, `PUT /api/v1/users/{id}`
- **Activities:** `POST /api/v1/activities`, `GET /api/v1/activities`
- **Emission Factors:** `GET /api/v1/emission-factors`, `POST /api/v1/emission-factors`

*For a detailed guide on how to format your JSON requests, refer to the API Cheat Sheet!*
