# 🚀 Task Management & Messaging System

This is a full-stack web application designed for **task creation, assignment, and management**, with built-in **real-time messaging**, **notifications**, and **role-based access control**. Users can sign up, log in, and collaborate efficiently through role-specific task assignments and live communication.

> 🔗 **Live App**: [https://reactapp-gatewayapi.onrender.com/UI/login](https://reactapp-gatewayapi.onrender.com/UI/login)

---

## 📌 Features

- 📝 **Task Creation & Management**
  - Tasks can be categorized as **Development**, **QA/Testing**, **Documentation**, **Code Review**, etc.
  - Role-based eligible users are shown in the "Assign To" dropdown based on task type

- 🗂️ **Role-Based Access**
  - Predefined roles: `ADMIN`, `USER`, and `DEVELOPER`
  - Admins can create custom roles and assign/remove tasks to/from each role
  - Admins can update user roles dynamically

- 💬 **Real-Time Messaging**
  - Users can send and receive live messages instantly

- 🔔 **Notifications**
  - Real-time alerts for messages and task updates

- 👤 **User Management & Authentication**
  - Secure login and session handling (Session/JWT based)
  - Signup with **unique User ID** (real-time checker implemented)

---

## 🛠 Tech Stack

- **Frontend**: React with Material-UI
- **Backend**: Spring Boot
  - **API Gateway**: Spring Cloud Gateway (authentication, routing, signup)
  - **User Service**: Handles tasks, roles, messages, notifications
- **Deployment**: Render
- **Authentication**: Session/JWT based (implemented)
- **Email Verification**: 🔜 *Coming soon*

---

## 📁 Project Structure

This application uses a **microservices architecture** with the following standalone services:

gateway-api # Handles authentication, user registration, and routing (Spring Boot + Spring Cloud Gateway)
user-service # Manages tasks, roles, role-task mappings, notifications, and messaging (Spring Boot)
frontend-ui # React application with Material-UI, served as static files

Each project is maintained independently and can be deployed separately.

---