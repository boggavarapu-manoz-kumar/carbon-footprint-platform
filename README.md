<div align="center">
  <h1>🌱 EcoTrack - Carbon Footprint Monitoring Platform</h1>
  <p>
    <strong>An intelligent platform for tracking, analyzing, and reducing your carbon footprint through data-driven sustainability insights.</strong>
  </p>
</div>

---

## 📖 Overview

The **Carbon Footprint Monitoring Platform** is a full-stack sustainability management system designed to help individuals and organizations understand and reduce their environmental impact. 

By logging daily activities across transportation, electricity consumption, food intake, and shopping habits, the platform converts actions into measurable carbon emissions (CO₂e) using scientifically recognized emission factors. Through gamification, powerful analytics, and tailored recommendations, it empowers users to achieve their sustainability goals.

## ✨ Features

- **Activity Tracking**: Log daily carbon-emitting activities across various categories (Transport, Food, Energy, Shopping).
- **Carbon Calculation Engine**: Accurately compute CO₂ equivalents using standardized emission factors.
- **Analytics Dashboard**: Visualize daily, weekly, and monthly carbon footprint trends with interactive charts.
- **Smart Recommendations**: Receive personalized AI-driven tips on how to reduce your carbon footprint based on your highest emission areas.
- **Gamification & Goals**: Set reduction targets, track progress, and earn badges for reaching sustainability milestones.
- **Corporate & Community Support**: Organization-level dashboards for team analytics and ESG/CSR reporting.

## 🏗️ Architecture

The project follows a standard three-tier web architecture for modularity and scalability:

- **Frontend**: React.js, Vite, Material UI (MUI), Recharts
- **Backend**: Java 21, Spring Boot 3, Spring Security (JWT & OAuth2)
- **Database**: MySQL 8
- **Deployment**: Docker, Nginx (Planned)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Java 21](https://adoptium.net/) (JDK 21)
- [Maven](https://maven.apache.org/)
- [MySQL 8](https://www.mysql.com/)

### 1. Database Setup

Create a new MySQL database for the application:
```sql
CREATE DATABASE carbon_footprint_db;
```

### 2. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables. Update `src/main/resources/application.yml` or create an `.env` file with your MySQL credentials and JWT secret.
3. Build and run the application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

## 📂 Project Structure

```
carbon-footprint-platform/
├── backend/                  # Spring Boot Java Application
│   ├── src/main/java/...     # Core application code (Controllers, Services, Repositories, Security)
│   ├── src/main/resources/   # Application configuration and schema
│   └── pom.xml               # Maven dependencies
│
├── frontend/                 # React Application
│   ├── src/                  # React components, pages, contexts, and API services
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
│
└── README.md                 # Project documentation
```

## 🔐 Security

- **Authentication**: JWT-based stateless authentication.
- **Authorization**: Role-based access control (User, Admin, Organization Manager).
- **Data Protection**: Secure password hashing with BCrypt.

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
