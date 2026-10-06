# Business Management System — Frontend

A modern, responsive business management web application built with **Angular** and **Bootstrap**. The application provides a permission-based user interface for managing business operations such as products, categories, suppliers, users, roles, permissions, and dashboard analytics.

## 🚀 Tech Stack

* **Angular 21**
* **TypeScript**
* **Bootstrap 5**
* **Bootstrap Icons**
* **ng2-charts**
* **RxJS**
* **Angular Router**
* **REST API Integration**
* **JWT Authentication**
* **Role & Permission-Based Authorization**

## ✨ Features

### Authentication & Security

* JWT-based authentication
* Login and logout
* Authentication guard
* Automatic JWT token injection using HTTP interceptor
* Password change requirement handling
* Permission-based route protection
* Unauthorized users redirected to a 404 page

### Dashboard

* Responsive dashboard
* Business statistics and summary cards
* Chart-based data visualization
* Permission-aware dashboard access

### User Management

* User listing
* Create and update users
* User activation/deactivation
* Role assignment
* Permission-aware actions

### Role & Permission Management

* Role management
* Permission management
* Dynamic permission-based UI
* Permission-based route access
* Permission-aware buttons and menu items

### Product Management

* Product listing
* Product creation and editing
* Product status management
* Category integration
* Permission-controlled actions

### Category Management

* Category listing
* Create and update categories
* Category status management
* Permission-controlled actions

### Supplier Management

* Supplier listing
* Create and update suppliers
* Supplier status management
* Permission-controlled actions

## 🔐 Authorization Architecture

The frontend uses a permission-based authorization approach.

```text
User
  ↓
Role
  ↓
Permissions
  ↓
Login Response
  ↓
Local Storage
  ↓
PermissionService
  ↓
Guards + Routes + UI Actions
```

This allows the interface to dynamically display or hide features according to the logged-in user's permissions.

## 🧭 Application Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/
│   │   └── models/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── products/
│   │   ├── categories/
│   │   └── suppliers/
│   │
│   └── shared/
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── assets/
```

## 🔗 Backend API

The Angular application communicates with a Spring Boot REST API.

### Local Development

```text
http://localhost:8080/api
```

The API URL is configured through Angular environment files.

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

## 🐳 Docker

The frontend can also be run using Docker and Nginx.

### Build Docker Image

```bash
docker build -t business-management-ui .
```

### Run Container

```bash
docker run -p 4200:80 business-management-ui
```

Then open:

```text
http://localhost:4200
```

## 💻 Local Development

### Prerequisites

* Node.js 20+
* npm
* Angular CLI

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
ng serve
```

Application:

```text
http://localhost:4200
```

### Production Build

```bash
npm run build
```

## 📱 Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

Bootstrap's responsive layout system is used throughout the application.

## 🔒 Security Considerations

* JWT tokens are used for authenticated API requests.
* Protected routes use Angular route guards.
* HTTP requests automatically include the JWT authorization header.
* UI actions are controlled using backend-provided permissions.
* Sensitive environment values are not committed to Git.

> Frontend authorization improves the user experience, but actual authorization is enforced by the backend API.

## 🧪 Testing

The project can be tested locally using the Angular development server and the connected Spring Boot backend.

```bash
npm test
```

## 📦 Related Backend

Backend repository:

`https://github.com/MalakaRM/business-management-api`

## 👨‍💻 Project Purpose

This project was developed as a portfolio-level full-stack business management system to demonstrate practical experience with:

* Angular application architecture
* REST API integration
* JWT authentication
* Role-based and permission-based authorization
* Responsive UI development
* Docker containerization
* Git and GitHub workflow
* Full-stack application development
