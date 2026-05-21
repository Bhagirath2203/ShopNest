# 🛒 ShopNest

A full-stack e-commerce platform built with **Spring Boot**, **React.js**, **MySQL**, **Redis**, **Docker**, and **AWS**.

## Tech Stack

| Layer        | Technology                              |
|-------------|------------------------------------------|
| Backend      | Java 17, Spring Boot 3, Spring Security |
| Frontend     | React.js 18, React Router, Axios        |
| Database     | MySQL 8                                  |
| Caching      | Redis 7                                  |
| Auth         | JWT (JSON Web Tokens)                    |
| AI           | Google Gemini API                        |
| DevOps       | Docker, Docker Compose, AWS EC2/S3      |

## Features

- 🔐 **Secure Auth** — JWT-based login/register with role-based access (USER / ADMIN)
- 📦 **Product Catalog** — Browse, search, and filter products
- 🛒 **Cart Management** — Add/remove items, update quantities
- 📋 **Order Processing** — Complete order lifecycle from cart to confirmation
- ⚡ **Redis Caching** — Cached product listings for high-frequency reads
- 🤖 **AI Descriptions** — Google Gemini-powered product description generation
- 🐳 **Dockerized** — One-command local setup with Docker Compose

## Project Structure

```
ShopNest/
├── backend/          # Spring Boot REST API
├── frontend/         # React.js SPA
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- MySQL 8 (or use Docker)

### Run with Docker (Recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- MySQL: localhost:3307

### Run Individually

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## API Endpoints (Planned)

| Method | Endpoint              | Description           | Auth     |
|--------|----------------------|-----------------------|----------|
| POST   | /api/auth/register   | Register new user     | Public   |
| POST   | /api/auth/login      | Login & get JWT       | Public   |
| GET    | /api/products        | List all products     | Public   |
| POST   | /api/products        | Add product           | ADMIN    |
| GET    | /api/cart             | View cart             | USER     |
| POST   | /api/cart/add        | Add item to cart      | USER     |
| POST   | /api/orders          | Place order           | USER     |
| POST   | /api/ai/describe     | AI product description| ADMIN    |

## License

This project is for educational and portfolio purposes.
