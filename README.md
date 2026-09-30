# ⚡ Accounting Node.TS

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/Bun-Runtime-FBF0DF?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/Argon2id-Security-red?style=for-the-badge&logo=auth0&logoColor=white" alt="Argon2id" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Swagger_UI-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

A strictly-typed, high-performance multi-tenant accounting and invoicing engine built with **TypeScript**, **Express 5**, **Bun / Node.js**, and **PostgreSQL**.

---

## 🎯 Goal of the Project

The goal of **`accounting-node.TS`** is to provide modern development teams and enterprise accountants with a type-safe, developer-friendly backend service that delivers:
- 🛡️ **Next-Gen Security**: Industry-standard **Argon2id** password hashing with high memory cost and parallel execution.
- 📘 **Interactive Documentation**: Instant API testing and verification via built-in **Swagger UI** at `/docs`.
- 🗂️ **Type-Safe Multi-Tenancy**: Complete TypeScript interfaces for customers, stock items, invoices, and ledger statements.
- ⚡ **Bun Engine Support**: Ultra-fast hot reloading, native ESM execution, and rapid bundle build times.
- 🧾 **ACID Invoicing**: Database-level transaction safety ensuring inventory stock and billing lines stay synchronized.

---

## 💡 The Problem It Solves

- **Lack of Static Type Checking**: Pure JavaScript billing code can lead to silent `undefined` arithmetic bugs and database field mismatches. TypeScript guarantees compile-time validation.
- **Outdated Cryptography**: Legacy `bcrypt` is vulnerable to modern ASIC and GPU parallel cracking attacks; `accounting-node.TS` implements memory-hard **Argon2id**.
- **Undocumented APIs**: Monolithic services often lack up-to-date specs; this project bundles an **OpenAPI 3.0 / Swagger UI** playground served directly by the server.
- **Payload Overhead**: Financial statements can be huge; built-in native **Gzip streaming** cuts network payloads by 80–90%.

> [!NOTE]
> For complete database schema definitions and multi-tenant table structures, see the [Detailed Architecture Guide](file:///home/zoro/Projects/github/accounting-node.TS/docs/ARCHITECTURE.md).

---

## 📖 Interactive Swagger UI

Open your browser while the server is running to interactively test all API endpoints:
👉 [**`http://localhost:420/docs`**](http://localhost:420/docs)

---

## 🚀 How to Install & Run

### 🐳 Running with Docker (Recommended)

1. Navigate to the repository:
   ```bash
   cd /home/zoro/Projects/github/accounting-node.TS
   ```

2. Launch app and PostgreSQL with Docker Compose:
   ```bash
   docker compose -f compose.yml up --build -d
   ```

3. View live server logs:
   ```bash
   docker compose -f compose.yml logs -f app
   ```

4. Stop services:
   ```bash
   docker compose -f compose.yml down -v
   ```

---

### ⚡ Running with Bun (Fastest)

```bash
# Install dependencies
bun install

# Run in watch mode for development
bun run dev

# Run in production mode
bun run start
```

---

### 💻 Running with Node.js & TypeScript

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (.env)
cat <<EOF > .env
PORT=420
USER=postgres
HOST=localhost
DATABASE=accounting_db
PASSWORD=your_postgres_password
TOKEN_KEY=your_jwt_signing_key_here
ENV=dev
EOF

# 3. Start development server using tsx
npx tsx src/app.ts
```
The server will start at: `http://localhost:420`  
Swagger UI documentation: `http://localhost:420/docs`

---

## 📡 API Input & Output Examples

### 1. 🔐 User Registration (`POST /auth/signup`)
Provisions a new tenant with Argon2id encrypted credentials and issues a JWT token.

**Request:**
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Global Traders",
  "username": "globaltraders",
  "email": "info@globaltraders.com",
  "password": "UltraSecurePassword123!",
  "gstin": "29ABCDE1234F1Z5",
  "pan": "ABCDE1234F",
  "aadhaar": "123456789012",
  "phone": "9876543210",
  "address": "Electronic City, Bangalore"
}
```

**Response (`201 Created`):**
```json
{
  "message": "User created successfully",
  "user": {
    "name": "Global Traders",
    "username": "globaltraders",
    "email": "info@globaltraders.com",
    "gstIn": "29ABCDE1234F1Z5",
    "phone": "9876543210",
    "address": "Electronic City, Bangalore"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. 🔑 User Login (`POST /auth/login`)
Authenticates against the Argon2id hash and issues a signed JWT.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "globaltraders",
  "password": "UltraSecurePassword123!"
}
```

**Response (`200 OK`):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. 👥 Add Customer (`POST /customer/add`)
Inserts customer into `<username>_customers` and assigns a sequential `cust_XXX` identifier.

**Request:**
```http
POST /customer/add
Content-Type: application/json

{
  "name": "Vertex Logistics",
  "address": "77 Ring Road, Hyderabad",
  "phone": "9876543210",
  "email": "billing@vertex.com",
  "gstIN": "36AAACB2212P1Z0",
  "dealer_type": "Regular",
  "pan": "AAACB2212P",
  "aadhaar": "998877665544",
  "username": "globaltraders"
}
```

**Response (`201 Created`):**
```json
{
  "message": "customer created successfully",
  "customer": [
    {
      "id": 1,
      "cust_id": "cust_001",
      "name": "Vertex Logistics",
      "address": "77 Ring Road, Hyderabad",
      "phone_number": "9876543210",
      "email": "billing@vertex.com",
      "gstin": "36AAACB2212P1Z0",
      "dealer_type": "Regular",
      "pan_card": "AAACB2212P",
      "aadhaar": "998877665544"
    }
  ]
}
```

---

### 4. 📦 Add Product to Inventory (`POST /inventory/add`)
Creates inventory items with quantity and unit price.

**Request:**
```http
POST /inventory/add
Content-Type: application/json

{
  "username": "globaltraders",
  "product_name": "Optical Sensor Pro",
  "quantity": 250,
  "unit_price": 75.50
}
```

**Response (`200 OK`):**
```json
{
  "messge": "Product added",
  "result": null
}
```

---

### 5. 🧾 Create Transactional Invoice (`POST /invoice/add`)
Atomically validates lines, fetches live unit prices from inventory, and generates an invoice.

**Request:**
```http
POST /invoice/add
Content-Type: application/json

{
  "username": "globaltraders",
  "invoice": {
    "customer_id": "cust_001",
    "total": 755.00,
    "total_discount": 50.00,
    "packaging": 20.00,
    "freight": 25.00,
    "taxable_amount": 755.00,
    "tax_collected_at_source": 0.00,
    "round_off": 0.00,
    "grand_total": 750.00,
    "method_of_payment": "NEFT",
    "invoiceLines": [
      {
        "product_id": 1,
        "quantity": 10
      }
    ]
  }
}
```

**Response (`201 Created`):**
```json
{
  "message": "invoice created successfully",
  "invoice": {
    "customer_id": "cust_001",
    "transaction_id": "txn_20260930120000000000000",
    "grand_total": 750.00,
    "method_of_payment": "NEFT",
    "invoiceLines": [
      {
        "product_id": 1,
        "quantity": 10,
        "amount": 755.00
      }
    ]
  }
}
```

---

### 6. 📑 Retrieve Audit Statement (`GET /stmt/get`)
Retrieves comprehensive billing statements compressed with **Gzip**.

**Request:**
```bash
curl -X GET "http://localhost:420/stmt/get?username=globaltraders&action=thisQuarter" --compressed
```

**Response (`200 OK` - Headers: `Content-Encoding: gzip`):**
```json
{
  "invoices": [
    {
      "id": 1,
      "transaction_id": "txn_20260930120000000000000",
      "customer_id": {
        "cust_id": "cust_001",
        "name": "Vertex Logistics",
        "gstin": "36AAACB2212P1Z0"
      },
      "total": "755.00",
      "grand_total": "750.00",
      "date_time": "2026-09-30T08:30:00.000Z",
      "method_of_payment": "NEFT"
    }
  ]
}
```

---

## 📄 License

GPL v3.0 License. See package configuration for details.