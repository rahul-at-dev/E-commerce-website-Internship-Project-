# ElectroCart — Electronics Storefront + REST API

A small full-stack assignment project built with **Node.js, Express, MongoDB Atlas, Mongoose and JWT**. It includes a responsive yellow-and-white electronics storefront, account registration/login, and a protected product CRUD API.

## Features

- User registration and login with passwords hashed using `bcryptjs` (12 salt rounds).
- JWT access token authentication. Protected endpoints return `401` when the token is missing, invalid or expired.
- Full product CRUD: create, list, read one, update and delete.
- Validation on registration, login and product create/update requests.
- Consistent JSON responses and HTTP status codes.
- Responsive storefront, product search/category filter, basic client-side cart, and product management controls.
- Cart and token are stored in browser `localStorage` for this learning/demo project.

> **Demo security note:** For assignment simplicity, every authenticated user can create, edit and delete products. A real e-commerce application should add roles (for example, `admin` and `customer`), authorize writes only for admins, and restrict product updates/deletes to the product owner or admins. The cart is client-side only; there is no order/payment flow.

## 1. Requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas account (or a local MongoDB server)

## 2. Installation and configuration

1. Extract the ZIP file.
2. Open the extracted `electrocart-api` folder in VS Code.
3. Open a terminal in that folder and install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to a new file named `.env`.
5. In MongoDB Atlas, create a cluster and database user. Add your current IP address under **Network Access**. For local development, use the IP access entry Atlas recommends; avoid leaving `0.0.0.0/0` enabled in production.
6. In Atlas, choose **Connect → Drivers → Node.js**, copy the connection string, and replace the placeholders in `MONGODB_URI` in `.env`. URL-encode special characters in the database password. The database name in this sample URI is `electrocart`.
7. Replace `JWT_SECRET` with a long, random secret (at least 32 characters). Keep `.env` private; never commit or share it.
8. Start the server:

   ```bash
   npm run dev
   ```

9. Visit `http://localhost:5000`. The API health check is `http://localhost:5000/api/health`.

MongoDB creates the `electrocart` database and collections automatically when the first user or product document is inserted. You do not need to create the collections manually.

## 3. Environment variables

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://.../electrocart?...` |
| `JWT_SECRET` | Secret used to sign JWTs | Long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5000` |

## 4. API conventions

- Base URL: `http://localhost:5000/api`
- Send JSON request bodies with `Content-Type: application/json`.
- Protected endpoints require this header:

  ```http
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

- Successful responses use `{ "success": true, ... }`.
- Error responses use `{ "success": false, "message": "...", "errors": [] }` where relevant.

## 5. Authentication endpoints

### Register

`POST /api/auth/register` — public — **201 Created**

Request body:

```json
{
  "name": "Alex Kumar",
  "email": "alex@example.com",
  "password": "securepass123"
}
```

Response shape:

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "id": "USER_ID", "name": "Alex Kumar", "email": "alex@example.com" },
    "token": "JWT_TOKEN"
  }
}
```

Validation: name is required (max 60 characters), email must be valid, password must be 8–72 characters. Duplicate email returns **409 Conflict**. Passwords are hashed before storage.

### Login

`POST /api/auth/login` — public — **200 OK**

Request body:

```json
{ "email": "alex@example.com", "password": "securepass123" }
```

Response: same `data.user` and `data.token` structure as registration. Invalid credentials return **401 Unauthorized**.

### Current user

`GET /api/auth/me` — protected — **200 OK**

Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

Response:

```json
{
  "success": true,
  "data": { "user": { "id": "USER_ID", "name": "Alex Kumar", "email": "alex@example.com" } }
}
```

## 6. Product endpoints (all protected)

Product categories: `Phones`, `Laptops`, `Audio`, `Wearables`, `Accessories`, `Gaming`.

Product request fields:

```json
{
  "name": "Studio Wireless Headphones",
  "description": "Comfortable wireless headphones with clear sound.",
  "category": "Audio",
  "price": 3499,
  "stock": 15,
  "image": "https://example.com/headphones.jpg"
}
```

`image` is optional; if provided, it must be a valid HTTP/HTTPS URL. `price` must be a non-negative number and `stock` a non-negative integer.

| Method | Path | Purpose | Success |
|---|---|---|---|
| `GET` | `/api/products` | List products | `200 OK` |
| `GET` | `/api/products/:id` | Get one product | `200 OK` |
| `POST` | `/api/products` | Create a product | `201 Created` |
| `PUT` | `/api/products/:id` | Update a product | `200 OK` |
| `DELETE` | `/api/products/:id` | Delete a product | `200 OK` |

Every product endpoint requires `Authorization: Bearer YOUR_JWT_TOKEN`.

### List products

`GET /api/products?category=Audio&search=wireless`

Both query parameters are optional. Response:

```json
{ "success": true, "count": 1, "data": { "products": [ { "_id": "PRODUCT_ID", "name": "Studio Wireless Headphones", "category": "Audio", "price": 3499, "stock": 15 } ] } }
```

### Get one product

`GET /api/products/PRODUCT_ID`

Response:

```json
{ "success": true, "data": { "product": { "_id": "PRODUCT_ID", "name": "Studio Wireless Headphones", "description": "...", "category": "Audio", "price": 3499, "stock": 15 } } }
```

### Create product

`POST /api/products`

Send the product request body shown above. Response: **201 Created**, `{ "success": true, "message": "Product created.", "data": { "product": { ... } } }`.

### Update product

`PUT /api/products/PRODUCT_ID`

Send the same product fields as create. All fields are validated. Response: **200 OK**, `{ "success": true, "message": "Product updated.", "data": { "product": { ... } } }`.

### Delete product

`DELETE /api/products/PRODUCT_ID`

Response: **200 OK**, `{ "success": true, "message": "Product deleted.", "data": { "id": "PRODUCT_ID" } }`.

## 7. Status codes

| Status | Meaning in this API |
|---|---|
| `200` | Successful read, login, update or delete |
| `201` | User or product created |
| `400` | Invalid input, malformed ID or validation failure |
| `401` | Missing/invalid/expired token or invalid login credentials |
| `404` | Unknown route or product not found |
| `409` | Email already registered |
| `500` | Unexpected server error |

## 8. Test with Postman

1. `POST /api/auth/register` with a name, email and password.
2. Copy `data.token` from the response.
3. In Postman, open **Authorization → Bearer Token** and paste the token.
4. Call `POST /api/products` with the sample product JSON.
5. Test `GET /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, and `DELETE /api/products/:id`.
6. Remove the Authorization header and call `GET /api/products`. It should return **401**.
7. Try an empty product name or invalid category. It should return **400** with field-level validation messages.

## 9. Project structure

```text
electrocart-api/
├── public/
│   ├── index.html       # Storefront UI
│   ├── styles.css       # Responsive yellow/white theme
│   └── app.js           # Auth, API calls, product UI and cart
├── src/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/User.js
│   ├── models/Product.js
│   └── routes/
│       ├── authRoutes.js
│       └── productRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 10. Before production

Use HTTPS, secure cookie-based token storage or another appropriate session strategy, rate-limit authentication endpoints, add role-based access control, add ownership/admin checks, configure strict CORS, validate image uploads through a trusted storage service, and implement server-side orders and payment verification. Do not treat the demo cart as a real order.
