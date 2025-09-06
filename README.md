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
- [Contributors](#contributors)
- [License](#license)

---

## Project Overview

A cloud-native, scalable Cake Shop Ordering System with microservices architecture that supports product catalogs, cart management, order processing, and asynchronous notification delivery.

---

## Architecture Introduction

- 👤 **User Service:** User signup and login  
- 🎂 **Product Service:** Cake catalog and inventory management  
- 🛒 **Cart Service:** Cart and product selection features  
- 📦 **Order Service:** Handles order placement with transactions  
- 🔔 **Notification Service:** Sends email and SMS via RabbitMQ  
- 🔄 **RabbitMQConsumer Service:** Processes message queue events  
- 🚪 **API Gateway:** Routes requests and handles JWT authentication  

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
- Kubernetes cluster (local Minikube, Docker Desktop or cloud-based) ☸️  
- RabbitMQ server or Kubernetes RabbitMQ deployment 🐰  
- Jenkins server configured with Docker and Kubernetes access ⚙️  
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
5. Access API Gateway at:
   http://localhost:8081
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
4. Access API Gateway exposed as NodePort (default: port 30081) or configured Ingress.

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

## API Gateway Code Summary

- Proxy middleware routes requests to respective microservices (food, user, cart, order)  
- CORS is enabled with allowed origin set to frontend URL  
- Health check endpoint available at `/health`  
- Runs on port 8081 by default  

---

## Frontend Dockerfile Summary

- Multi-stage Dockerfile builds React app using Node  
- Serves static files using Nginx stable alpine image  
- Exposes port 80 for frontend access  

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

---
   
