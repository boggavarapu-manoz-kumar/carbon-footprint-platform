# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project Title

**Web Platform for Carbon Footprint Monitoring and Sustainability Analytics**

---

# Document Information

| Item                    | Details                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| Project Name            | Web Platform for Carbon Footprint Monitoring and Sustainability Analytics |
| Document Type           | Software Requirements Specification (SRS)                                 |
| Version                 | 1.0                                                                       |
| Prepared By             | Manoj Kumar                                                               |
| Technology Stack        | React.js, Spring Boot, Java, MySQL                                        |
| Architecture            | Three-Tier Web Architecture                                               |
| Deployment              | Docker Based Cloud Deployment                                             |
| Development Methodology | Agile Scrum                                                               |
| Document Standard       | IEEE 830 SRS Standard                                                     |

---

# 1. INTRODUCTION

## 1.1 Purpose

The purpose of this system is to provide individuals and organizations with an intelligent platform for tracking, analyzing, and reducing their carbon footprint through data-driven sustainability insights.

The platform enables users to record their daily activities such as transportation, electricity consumption, food intake, and shopping habits. These activities are converted into carbon emissions using scientifically recognized emission factors.

The system provides:

* Carbon footprint calculations
* Sustainability analytics
* Goal tracking
* Recommendation generation
* Community benchmarking
* Organizational sustainability reporting

---

## 1.2 Scope

The Carbon Footprint Monitoring Platform is a web-based sustainability management system designed to help users understand and reduce environmental impact.

The system supports:

### Individual Users

* Activity Logging
* Carbon Calculation
* Dashboard Analytics
* Goal Management
* Recommendations
* Badge Achievements

### Organizations

* Employee Sustainability Tracking
* Corporate Dashboard
* Sustainability Reporting
* Team Analytics

---

## 1.3 Objectives

### Primary Objectives

* Measure personal carbon footprint accurately
* Increase sustainability awareness
* Encourage eco-friendly behavior
* Support environmental reporting

### Secondary Objectives

* Promote green communities
* Create gamification through badges
* Generate actionable recommendations
* Enable CSR reporting

---

# 2. OVERALL DESCRIPTION

## 2.1 Product Perspective

The platform functions as a centralized sustainability management ecosystem.

### System Components

1. User Management System
2. Activity Tracking System
3. Carbon Calculation Engine
4. Analytics Engine
5. Recommendation Engine
6. Goal Tracking System
7. Community Platform
8. Corporate Dashboard

---

## 2.2 Product Functions

### User Functions

* Registration
* Login
* Profile Management
* Activity Logging
* Goal Creation
* Dashboard Viewing
* Progress Monitoring

### Admin Functions

* Manage Emission Factors
* Manage Users
* View Platform Analytics
* Configure Rules

### Organization Functions

* Employee Monitoring
* Sustainability Reports
* Comparative Analysis

---

## 2.3 User Classes

### Normal User

Tracks personal footprint.

### Premium User

Advanced analytics access.

### Organization Manager

Access to company-level analytics.

### System Administrator

Complete system management.

---

## 2.4 Operating Environment

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* Recharts

### Backend

* Java 21
* Spring Boot 3
* Spring Security
* JWT

### Database

* MySQL 8

### Server

* Docker
* Linux
* Nginx

### Browser Support

* Chrome
* Firefox
* Edge
* Safari

---

# 3. SYSTEM ARCHITECTURE

## Architectural Pattern

### Three-Tier Architecture

### Presentation Layer

* React UI
* Dashboards
* Charts
* Forms

### Business Layer

* Spring Boot APIs
* Authentication
* Analytics
* Recommendation Engine

### Data Layer

* MySQL Database
* Emission Factors
* User Data
* Activity Logs

---

## Architecture Flow

```text
User
  ↓
React Frontend
  ↓
REST API Gateway
  ↓
Spring Boot Services
  ↓
Business Logic Layer
  ↓
MySQL Database
```

---

# 4. FUNCTIONAL REQUIREMENTS

# Module 1: User Management

## FR-1 Registration

Users shall register using:

* Name
* Email
* Password

### Validation

* Email uniqueness
* Password complexity

---

## FR-2 Login

Users shall login using:

* JWT Authentication

Optional:

* Google OAuth2

---

## FR-3 Profile Management

Users can:

* Edit Profile
* Change Password
* Configure Preferences

---

# Module 2: Activity Logging

## FR-4 Transportation Logging

User shall record:

* Car Travel
* Bike Travel
* Flights
* Bus
* Train

### Inputs

* Distance
* Travel Mode

### Output

* CO₂ Emission

---

## FR-5 Electricity Logging

User shall enter:

* Units Consumed (kWh)

System calculates:

```text
Emission = Units × Emission Factor
```

---

## FR-6 Food Logging

Categories:

* Vegetarian
* Non-Vegetarian
* Vegan

System computes food-related emissions.

---

## FR-7 Shopping Logging

Categories:

* Electronics
* Clothing
* Furniture
* General Purchases

---

# Module 3: Carbon Calculation Engine

## FR-8 Emission Calculation

Formula:

```text
Carbon Emission =
Activity Quantity × Emission Factor
```

Example:

```text
100 km Car Travel
×
0.192 kg CO₂/km

=
19.2 kg CO₂e
```

---

## FR-9 Emission Factor Management

Admin can:

* Add Factors
* Update Factors
* Disable Factors

---

# Module 4: Analytics Engine

## FR-10 Daily Analytics

Generate:

* Daily Footprint

---

## FR-11 Weekly Analytics

Generate:

* Weekly Footprint

---

## FR-12 Monthly Analytics

Generate:

* Monthly Footprint

---

## FR-13 Category Analysis

Breakdown by:

* Transport
* Electricity
* Food
* Shopping

---

# Module 5: Recommendation Engine

## FR-14 Recommendation Generation

System identifies:

Top 3 emission categories.

Examples:

### Transport

"Use public transportation twice a week."

### Electricity

"Replace incandescent bulbs with LED bulbs."

### Food

"Reduce red meat consumption."

---

# Module 6: Goal Tracking

## FR-15 Goal Creation

Users can set:

* Target Reduction Percentage
* Duration

Example:

```text
Reduce Carbon Footprint by 20%
Within 3 Months
```

---

## FR-16 Progress Tracking

System shows:

* Goal Progress
* Completion Percentage
* Future Projection

---

# Module 7: Gamification

## FR-17 Badges

Examples:

* Green Beginner
* Eco Warrior
* Sustainability Champion

---

## FR-18 Leaderboard

Displays:

* Top Users
* Badges
* Rankings

---

# Module 8: Corporate Dashboard

## FR-19 Organization Analytics

Shows:

* Total Emissions
* Department Analytics
* Employee Comparison

---

## FR-20 CSR Reports

Generate:

* PDF Reports
* Monthly Reports
* Sustainability Reports

---

# 5. DATABASE DESIGN

## Tables

### Users

```text
user_id (PK)
name
email
password
role
created_at
```

### Activity Logs

```text
log_id (PK)
user_id (FK)
category
activity_type
quantity
unit
co2_emission
log_date
```

### Emission Factors

```text
factor_id (PK)
activity_type
factor_value
unit
source
```

### Goals

```text
goal_id (PK)
user_id
target_percentage
duration
status
```

### Badges

```text
badge_id (PK)
badge_name
description
```

### User Badges

```text
user_badge_id
user_id
badge_id
earned_date
```

---

# 6. NON-FUNCTIONAL REQUIREMENTS

## Performance

* API Response < 2 Seconds
* Dashboard Load < 3 Seconds
* Support 10,000+ Users

---

## Security

* JWT Authentication
* Password Encryption
* HTTPS
* SQL Injection Prevention
* XSS Protection

---

## Reliability

* 99.9% Availability
* Automatic Recovery

---

## Scalability

* Horizontal Scaling
* Docker Deployment

---

## Maintainability

* Modular Architecture
* Clean Code Standards

---

# 7. EXTERNAL INTERFACES

## User Interface

### Dashboard

* Carbon Summary
* Pie Charts
* Trend Charts
* Goals Widget

### Admin Panel

* Emission Factors
* User Management

### Corporate Dashboard

* Team Analytics
* Reports

---

# 8. TESTING REQUIREMENTS

## Unit Testing

* JUnit 5

## API Testing

* Postman

## Integration Testing

* Spring Boot Integration Tests

## Performance Testing

* JMeter
* k6

## Frontend Testing

* React Testing Library

---

# 9. DEPLOYMENT REQUIREMENTS

## Docker Containers

```text
Frontend Container
Backend Container
MySQL Container
Redis Container
```

---

# 10. FUTURE ENHANCEMENTS

* AI Sustainability Assistant
* Carbon Credit Marketplace
* Mobile Application
* IoT Smart Meter Integration
* Smart Home Energy Monitoring
* Machine Learning Prediction Engine
* ESG Reporting Dashboard
* Blockchain Carbon Credit Verification

---

# 11. CONCLUSION

The **Web Platform for Carbon Footprint Monitoring and Sustainability Analytics** is a comprehensive sustainability management solution that enables individuals and organizations to monitor, analyze, and reduce their environmental impact. Through intelligent carbon calculations, personalized recommendations, gamification, and advanced analytics, the platform promotes sustainable behavior and supports global environmental goals while providing a scalable and secure enterprise-grade architecture.
