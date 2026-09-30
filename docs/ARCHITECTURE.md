# Accounting Node.TS

A high-performance, strictly-typed multi-tenant accounting and billing backend built with **TypeScript**, **Express 5**, **Bun / Node.js**, and **PostgreSQL**.

---

## Table of Contents

- [Overview](#overview)
- [Key Improvements Over `accounting-node.js`](#key-improvements-over-accounting-nodejs)
- [Architecture & Design Principles](#architecture--design-principles)
- [Interactive Swagger API Documentation](#interactive-swagger-api-documentation)
- [Directory Structure](#directory-structure)
- [Tech Stack & Dependencies](#tech-stack--dependencies)
- [Prerequisites & Environment Configuration](#prerequisites--environment-configuration)
- [Installation & Running](#installation--running)
  - [Running with Bun (Recommended)](#running-with-bun-recommended)
  - [Running with Node.js & TypeScript](#running-with-nodejs--typescript)
- [Database Schema & Multi-Tenancy Strategy](#database-schema--multi-tenancy-strategy)
- [API Reference](#api-reference)
  - [Authentication (`/auth`)](#authentication-auth)
  - [Customer Management (`/customer`)](#customer-management-customer)
  - [Inventory Management (`/inventory`)](#inventory-management-inventory)
  - [Invoices & Billing (`/invoice`)](#invoices--billing-invoice)
  - [Account Statements (`/stmt`)](#account-statements-stmt)
- [Performance & Network Optimization](#performance--network-optimization)
- [Security Model](#security-model)
- [Roadmap & Microservices Migration](#roadmap--microservices-migration)
- [License](#license)

---

## Overview

`accounting-node.TS` represents the modern TypeScript port of the monolithic `accounting-node.js` system. It provides end-to-end type safety, modern password hashing standards via **Argon2id**, native OpenAPI 3.0 documentation served dynamically via **Swagger UI**, and modularized controllers for financial statement reporting.

---

## Key Improvements Over `accounting-node.js`

1. **Strict TypeScript Typing**: Complete interfaces for user entities, customers, inventory products, invoices, and line items across the entire stack.
2. **Next-Generation Password Hashing (Argon2id)**: Upgraded from `bcrypt` to state-of-the-art `argon2` (Argon2id variant) with tuned memory cost ($2^{16}$) and multi-threading parallelism for enhanced brute-force resistance.
3. **Express 5**: Leverages the modern Express 5 framework with enhanced async error routing and promise-native handlers.
4. **Interactive OpenAPI 3.0 / Swagger UI**: Built-in Swagger documentation available at `/docs` backed by an OpenAPI 3.0 YAML specification.
5. **Decoupled Statement Service**: Dedicated `/stmt` router isolating audit reporting queries from transactional invoice processing.
6. **Bun & Modern ECMAScript Modules (ESM)**: Native support for Bun's ultra-fast execution engine and standard ES module imports.

---

## Architecture & Design Principles

- **Modular Domain Segregation**: Each feature (`auth`, `customers`, `inventory-management`, `invoices`, `statement`) encapsulates its router, data models, and utility functions.
- **Tenant-Isolated Dynamic Schemas**: Each business user owns isolated tables (`<username>_customers`, `<username>_invoices`, `<username>_invoice_lines`, `<username>_inventory`) dynamically provisioned on first write.
- **ACID Transaction Boundaries**: All composite financial operations (invoice header + line item creation) execute inside strict PostgreSQL `BEGIN ... COMMIT / ROLLBACK` blocks.
- **Gzip Streaming Delivery**: Heavy query endpoints (`/invoice/get`, `/stmt/get`) compress payloads with `zlib.gzip`, minimizing bandwidth consumption.

---

## Interactive Swagger API Documentation

Interactive OpenAPI 3.0 documentation is integrated and served directly by the application:

- **Swagger UI Endpoint**: `http://localhost:420/docs`
- **OpenAPI Specification**: Defined in [`docs/swagger.yaml`](file:///home/zoro/Projects/github/accounting-node.TS/docs/swagger.yaml) and [`src/docs/swagger.yaml`](file:///home/zoro/Projects/github/accounting-node.TS/src/docs/swagger.yaml).

Developers can test endpoints, explore request/response schemas, and inspect query parameter constraints directly from the browser.

---

## Directory Structure

```text
accounting-node.TS/
├── package.json                    # Project configuration, dependencies & scripts
├── tsconfig.json                   # TypeScript compiler configuration (ES2016 target, strict mode)
├── bun.lock                        # Bun dependency lockfile
├── Dockerfile                      # Container definition
├── compose.yml                     # Container orchestration definition
├── README.md                       # Complete documentation
├── docs/
│   ├── swagger.yaml                # OpenAPI 3.0 API Specification
│   ├── swagger.ts                  # Document loader module
│   └── swagger.js                  # Transpiled loader
└── src/
    ├── app.ts                      # Application entrypoint & route mounting
    ├── auth/
    │   ├── controller.ts           # Authentication handlers (/auth/signup, /auth/login)
    │   └── usermodel.ts            # User interface & users DAO
    ├── customers/
    │   ├── controller.ts           # Customer handlers (/customer/add, /customer/get)
    │   ├── customerModel.ts        # Customer interface & Customers DAO
    │   └── controlfunction.ts      # Auxiliary customer helpers
    ├── inventory-management/
    │   ├── controller.ts           # Inventory handlers (/inventory/add)
    │   └── inventoryModel.ts       # Product interface & Products DAO
    ├── invoices/
    │   ├── controller.ts           # Invoices handlers (/invoice/add, /invoice/get)
    │   ├── invoiveModels.ts        # Invoice & InvoiceLine interfaces & DAOs
    │   └── ctrlFunc.ts             # Filter generators (today, thisMonth, etc.)
    ├── statement/
    │   └── controller.ts           # Statement handlers (/stmt/get)
    ├── docs/
    │   ├── swagger.yaml            # OpenAPI 3.0 specification
    │   └── swagger.ts              # ESM/Bun compatible Swagger loader
    ├── middleware/
    │   └── tokenhandler.ts         # JWT generation, verification & renewal middleware
    ├── postgresql/
    │   └── dbconstants.ts          # PostgreSQL connection pool using pg.Pool
    ├── id_controller/
    │   └── id_genrator.ts          # Customer ID, Invoice ID & Argon2 hash utilities
    ├── server-security/
    │   └── server-security.ts      # Input sanitization utilities
    ├── devtrails/
    │   └── devtrails.ts            # Development query prototypes
    └── types/
        └── .env.d.ts               # Ambient TypeScript definitions for environment variables
```

---

## Tech Stack & Dependencies

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.9 | Strictly-typed JavaScript |
| **Runtime** | Bun / Node.js 20+ | Ultra-fast JS/TS runtime or LTS Node |
| **Web Framework** | Express 5.2 | High-performance routing with async error handling |
| **Database** | PostgreSQL + `pg` | Relational storage with connection pooling |
| **Security & Hashing** | `argon2` | Argon2id password hashing |
| **Tokens** | `jsonwebtoken` | Stateless JWT session tokens |
| **Documentation** | `swagger-ui-express` + `yamljs` | OpenAPI 3.0 visual interface |
| **Validation** | `express-validator` | Request sanitization and constraint validation |
| **Compression** | `zlib` | Gzip network payload compression |

---

## Prerequisites & Environment Configuration

### Prerequisites
- **Bun** (>= 1.0) or **Node.js** (>= 18.x)
- **PostgreSQL** running instance

### Environment Variables
Create a `.env` file in the project root:

```env
PORT=420
USER=postgres
HOST=localhost
DATABASE=accounting_db
PASSWORD=your_secure_password
TOKEN_KEY=your_jwt_signing_key_secret
ENV=dev
```

---

## Installation & Running

### Running with Bun (Recommended)

```bash
# Install dependencies
bun install

# Run in watch mode for development
bun run dev

# Run in production mode
bun run start
```

### Running with Node.js & TypeScript

```bash
# Install dependencies
npm install

# Run using tsx or ts-node
npx tsx src/app.ts
```

The application will start on:
- API Server: `http://localhost:420`
- Swagger Documentation: `http://localhost:420/docs`

---

## Database Schema & Multi-Tenancy Strategy

The database uses a hybrid tenancy model:

### 1. Global User Identity (`users`)
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gstIn VARCHAR(100) NOT NULL,
    pan_card VARCHAR(50) NOT NULL,
    adhaar VARCHAR(50) NOT NULL,
    phone VARCHAR (13) NOT NULL,
    address TEXT NOT NULL
);
```

### 2. Tenant Customer Directory (`<username>_customers`)
```sql
CREATE TABLE IF NOT EXISTS <username>_customers (
    id SERIAL PRIMARY KEY,
    cust_id TEXT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(13) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gstIN VARCHAR(255) NOT NULL UNIQUE,
    dealer_type VARCHAR(255) NOT NULL,
    pan_card VARCHAR(255) NOT NULL,
    aadhaar VARCHAR(255) NOT NULL
);
```

### 3. Tenant Stock & Inventory (`<username>_inventory`)
```sql
CREATE TABLE IF NOT EXISTS <username>_inventory (
    id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);
```

### 4. Tenant Invoices (`<username>_invoices`)
```sql
CREATE TABLE IF NOT EXISTS <username>_invoices (
    id SERIAL PRIMARY KEY,
    transaction_id TEXT UNIQUE,
    customer_id TEXT NOT NULL,
    date_time TIMESTAMP NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    total_discount DECIMAL(10,2) NOT NULL,
    packaging DECIMAL(10,2) NOT NULL,
    freight DECIMAL(10,2) NOT NULL,
    taxable_amount DECIMAL(10,2) NOT NULL,
    tax_collected_at_source DECIMAL(10,2) NOT NULL,
    round_off DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    method_of_payment TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES <username>_customers (cust_id)
);
```

### 5. Tenant Invoice Line Items (`<username>_invoice_lines`)
```sql
CREATE TABLE IF NOT EXISTS <username>_invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(256) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES <username>_inventory (id),
    FOREIGN KEY (invoice_id) REFERENCES <username>_invoices (transaction_id)
);
```

---

## API Reference

### Authentication (`/auth`)

#### `POST /auth/signup`
Creates a tenant account, generates Argon2id password hash, and returns JWT.
- **Request**:
  ```json
  {
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "gstin": "29ABCDE1234F1Z5",
    "pan": "ABCDE1234F",
    "aadhaar": "123456789012",
    "phone": "9876543210",
    "address": "Bangalore, India"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "User created successfully",
    "user": { ... },
    "token": "eyJhbGciOi..."
  }
  ```

#### `POST /auth/login`
Validates credentials against Argon2id hash and issues a JWT token.
- **Request**:
  ```json
  {
    "username": "janedoe",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOi..."
  }
  ```

---

### Customer Management (`/customer`)

#### `POST /customer/add`
Inserts a new customer into `<username>_customers` and assigns a sequential `cust_XXX` identifier.
- **Request**:
  ```json
  {
    "name": "Acme Corp",
    "address": "Tech District 4",
    "phone": "9876543210",
    "email": "corp@acme.com",
    "gstIN": "29AAAAA0000A1Z5",
    "dealer_type": "Regular",
    "pan": "AAAAA0000A",
    "aadhaar": "987654321098",
    "username": "janedoe"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "customer created successfully",
    "customer": [ ... ]
  }
  ```

#### `GET /customer/get?username={username}`
Returns all customers registered by the tenant.

---

### Inventory Management (`/inventory`)

#### `POST /inventory/add`
Adds a product with unit price and available stock.
- **Request**:
  ```json
  {
    "username": "janedoe",
    "product_name": "Precision Sensor V2",
    "quantity": 500,
    "unit_price": 75.25
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "messge": "Product added",
    "result": null
  }
  ```

---

### Invoices & Billing (`/invoice`)

#### `POST /invoice/add`
Transactionally creates master invoice and calculates line item costs by referencing the inventory price list.
- **Request**:
  ```json
  {
    "username": "janedoe",
    "invoice": {
      "customer_id": "cust_001",
      "date_time": "2026-09-29T10:00:00Z",
      "total": 7525.00,
      "total_discount": 100.00,
      "packaging": 50.00,
      "freight": 125.00,
      "taxable_amount": 7525.00,
      "tax_collected_at_source": 0.00,
      "round_off": 0.00,
      "grand_total": 7600.00,
      "method_of_payment": "Wire",
      "invoiceLines": [
        {
          "product_id": 1,
          "quantity": 100
        }
      ]
    }
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "invoice created successfully",
    "invoice": { ... }
  }
  ```

#### `GET /invoice/get`
Queries invoices with temporal filters (`action`):
- Actions: `today`, `toAndFromDate`, `thisMonth`, `thisWeek`, `thisQuarter`, `thisYear`, `beforeDate`, `afterDate`, `all`.
- Delivered as **Gzip compressed** JSON.

---

### Account Statements (`/stmt`)

#### `GET /stmt/get`
Fetches comprehensive audit statements combining invoice summaries and customer records. Returned as a **Gzip compressed** payload.
- **Parameters**: `username` (required), `action` (required), `sdate` (optional), `endate` (optional).

---

## Performance & Network Optimization

`accounting-node.TS` automatically compresses response payloads for billing queries using native `zlib.gzip`. This reduces wire transport sizes by 80–90% for large financial statements.

Clients receive standard HTTP compression headers:
```http
Content-Encoding: gzip
Content-Type: application/json
Vary: Accept-Encoding
```

---

## Security Model

1. **Argon2id Hashing**: High-cost cryptographic password protection resistant to GPU/ASIC cracking.
2. **Regex Input Sanitization**: Parameters are sanitized via `cleanAlphanumeric` to protect against SQL syntax injection in dynamic table identifiers.
3. **Strict Validation Chains**: Query and body parameters are validated through `express-validator`.
4. **Scoped Transactions**: Read-modify-write workflows execute in managed transaction scopes with explicit `ROLLBACK` on error.

---

## Roadmap & Microservices Migration

As business operations scale, `accounting-node.TS` is being migrated to a modern microservices architecture (`accounting-microservices`):
- **gRPC Inter-Service Communication**: Binary Protobuf serialization replaces direct database joins.
- **Polyglot Service Strategy**: Leveraging languages tailored to specific domains (e.g., Rust for transaction safety, Go for high-throughput gateway).
- **Clean Tenancy Redesign**: Partitioned PostgreSQL schemas replace dynamically named per-user tables.

---

## License

ISC License.