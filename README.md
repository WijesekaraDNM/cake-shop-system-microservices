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
  - [Jenkins Pipeline Configuration References](#Jenkins-Pipeline-Configuration-References)
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

...

### Jenkins Pipeline Configuration References

In the Jenkins pipeline, sensitive information such as API keys, passwords, and tokens are securely managed and **not included in the code repository or pipeline scripts**. However, the following configuration references are used publicly or as Kubernetes secrets injected during deployment:

#### Public or Non-Sensitive Configuration References

- **Docker Hub Repository Names:**  
  `masha230/user-service`, `masha230/food-service`, `masha230/cart-service`, `masha230/order-service`,  
  `masha230/notification-service`, `masha230/rabbitmqconsumer-service`, `masha230/api-gateway`, `masha230/frontend`

- **Kubernetes Namespace:**  
  `cakeshop`

- **Kubernetes Manifest Paths:**  
  `k8s/user-service.yaml`, `k8s/food-service.yaml`, `k8s/cart-service.yaml`, `k8s/order-service.yaml`,  
  `k8s/notification-service.yaml`, `k8s/rabbitmq.yaml`, `k8s/rabbitMQConsumer-service.yaml`, `k8s/api-gateway.yaml`, `k8s/frontend.yaml`

- **Docker Build Paths:**  
  `./apps/user-service`, `./apps/food-service`, `./apps/cart-service`, `./apps/order-service`,  
  `./apps/notification-service`, `./apps/rabbitMQConsumer-service`, `./api_gateway`, `./frontend`

#### Kubernetes Secrets Created During Deployment

The pipeline creates Kubernetes secrets (with sensitive values injected at runtime from Jenkins credentials) for each service, including but not limited to:

- `user-svc-secrets` containing:  
  - MongoDB connection URI for User Service  
  - JWT secret for user authentication  

- `food-svc-secrets` containing:  
  - MongoDB URI for Product Service  

- `cart-svc-secrets` containing:  
  - MongoDB URI for Cart Service  
  - JWT secret for cart service  

- `order-svc-secrets` containing:  
  - PostgreSQL connection URL for Order Service  

- `notification-svc-secrets` containing:  
  - SendGrid API key and sender email  
  - Twilio account SID, auth token, and phone number  

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


