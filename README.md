# 🍰 Cloud-Native Cake Shop Ordering System

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture Introduction](#architecture-introduction)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Local Development Using Docker](#local-development-using-docker)
  - [Kubernetes Deployment](#kubernetes-deployment)
  - [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
- [How to Use the System](#how-to-use-the-system)
- [Configuration Management](#configuration-management)
- [Challenges & Lessons Learned](#challenges--lessons-learned)

---

## Project Overview

A cloud-native, scalable Cake Shop Ordering System with microservices architecture that supports product catalogs, cart management, order processing, and asynchronous notification delivery.

---

## Architecture Introduction

This application follows a microservices architecture, consisting of:

- **API Gateway** (Port 8081) - Routes client requests to backend services, handles CORS and JWT authentication
- **User Service** (Port 5002) - User registration, login, and profile management
- **Product Service** (Port 5001) - Manage cake catalog and inventory
- **Cart Service** (Port 5003) - Manage shopping carts and selections
- **Order Service** (Port 5004) - Processes orders with transactional consistency
- **Notification Service** (Port 5005) - Sends confirmation emails and SMS asynchronously via RabbitMQ
- **RabbitMQ Consumer Service** - Processes asynchronous messages from RabbitMQ queues
- **Frontend** (Port 3000) - React-based SPA served with Nginx 

---

## Technology Stack

| Component          | Technology                                    |
|--------------------|-----------------------------------------------|
| Backend Frameworks  | Node.js, Express.js                           |
| API Gateway        | Node.js, Express.js, http-proxy-middleware   |
| Message Broker     | RabbitMQ                                     |
| Databases          | PostgreSQL (Orders), MongoDB (User, Product) | 
| Notification APIs  | SendGrid (Email), Twilio (SMS)                |
| Containerization   | Docker                                       |
| Orchestration      | Kubernetes (K8s)                             | 
| Config Management  | Kubernetes ConfigMaps and Secrets             |
| CI/CD              | Jenkins                                      |


---

## Setup Instructions

### Prerequisites

- Install [Docker](https://www.docker.com/get-started) and Docker Compose 🐳
- Node.js 18+ (optional, for local development) 
- Kubernetes cluster (local Minikube, Docker Desktop or cloud-based) ☸️  
- RabbitMQ server or Kubernetes RabbitMQ deployment 🐰  
- Jenkins server configured with Docker and Kubernetes access (K8s) ⚙️  
- API keys for SendGrid and Twilio (notification service) 📧📱  

---
### Local Development Using Docker

1. Clone the repo:
   git clone <repository-url>
   cd <repository-folder>
2. Build Docker images for all services and frontend:
   docker-compose build
3. Start all services together:
   docker-compose up
5. Access the app 
- Frontend UI: http://localhost:3000  
- API Gateway: http://localhost:8081  
- RabbitMQ Management UI (optional): http://localhost:15672 
---
### Kubernetes Deployment
1. Build Docker images and push to a container registry for all services and frontend:
   docker build -t <registry>/user-service ./apps/user-service
   docker push <registry>/user-service

Repeat for other services (`food-service`, `cart-service`, etc.)

2. Apply Kubernetes YAML configurations:
   kubectl apply -f k8s/
3. Verify service pods and scripts:  
   kubectl get pods -n cakeshop
   kubectl get svc -n cakeshop
4. Access services based on NodePort or Ingress config
- API Gateway NodePort default: 30081  
- Frontend NodePort default: 30080  

---

### Jenkins CI/CD Pipeline

The Jenkins pipeline automates:

- Cloning the GitHub repo  
- Building Docker images for all microservices, API Gateway, and frontend  
- Logging into Docker Hub securely  
- Pushing images to Docker registry  
- Creating Kubernetes secrets for sensitive configs  
- Applying Kubernetes deployment manifests for all services  
- Deploying RabbitMQ, its consumer, API Gateway, and frontend  

**To use:**  
- Set credentials (DockerHub password, Kubernetes config) in Jenkins  
- Trigger pipeline manually or via webhook from code repository  


---

## How to Use the System

- Sign up or log in via User Service  
- Browse cakes and categories via Product Service  
- Add or remove items from cart  
- Place orders through Order Service  
- Receive asynchronous confirmation notifications via Email/SMS  

---

## Configuration Management

- Sensitive info stored in Kubernetes Secrets  
- Environment variables managed by Kubernetes ConfigMaps  
- `.env` files excluded from source control and Docker builds  

---

## Challenges & Lessons Learned

- PostgreSQL connection and schema migrations  
- Secure management of secrets and environment variables in Kubernetes  
- Reliable event-driven setup with RabbitMQ  
- Designing a scalable and secure API Gateway  
- Automating builds and deployments with Jenkins  
- Designing for resiliency and fault tolerance  
- Decoupling services with event-driven communication  
- Embracing cloud-native application design principles  


