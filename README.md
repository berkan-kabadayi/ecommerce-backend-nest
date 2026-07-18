# ecommerce-backend-nest

A NestJS-based REST API backend for an e-commerce platform, built in three progressive stages: a core CRUD system, e-commerce features (roles, cart, orders, stock), and finally a full Claims-Based Access Control (CBAC) authorization layer.

## Features

- User registration, login, and JWT-based authentication (access + refresh tokens with rotation)
- Role-based user classification (`ADMIN`, `MODERATOR`, `USER`) combined with a dynamic, database-driven CBAC permission system
- Category CRUD
- Product management with category association, stock tracking, and advanced filtering/sorting
- Ordered product photo galleries with a mandatory primary photo and automatic re-ordering
- Product comments/reviews with automatic average rating and comment count updates
- Shopping cart management with stock validation (authenticated users only)
- Order creation with stock deduction, cart clearing, and order status tracking
- Global request validation and centralized exception handling

## Tech Stack

- **Language:** TypeScript
- **HTTP Server:** Express.js
- **Backend Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma ORM
- **Authentication:** Passport.js JWT with Refresh Token Rotation
- **Authorization:** Claims-Based Access Control (CBAC) — resource:action permission model
- **Password Hashing:** bcrypt
- **Validation:** class-validator, class-transformer
- **Testing:** Jest (unit + e2e)
- **Containerization:** Docker, Docker Compose
- **Code Quality:** ESLint, Prettier

## Architecture Overview

- Global API prefix: `/api`
- Global `ValidationPipe` enabled for automatic DTO validation and transformation
- Global exception filter for centralized error handling
- Database access abstracted through `PrismaService` / `PrismaModule`
- Feature-based modular structure (one module per domain)

## Development Stages

The project was built incrementally, per the original specification documents:

1. **Stage 1 — Core system:** basic auth (register/login/me/logout), user management, categories, products, product photos, and comments. No roles, no authorization — anyone with API access has full access.
2. **Stage 2 — E-commerce features:** user roles (`ADMIN` / `MODERATOR` / `USER`, stored but not yet enforced), cart, orders, stock management, and advanced product filtering/sorting.
3. **Stage 3 — Authorization:** full CBAC authorization layer — resource-based permissions, database-driven role-permission mapping, and enforcement across all endpoints via decorators/guards.

## Project Structure

```
src/
├── auth/
│   ├── constants/          # permissions.constant.ts
│   ├── decorators/         # permissions.decorator.ts, roles.decorator.ts
│   ├── dto/                # user-response.dto.ts
│   ├── guards/
│   │   └── auth/           # auth.guard, jwt-auth.guard, jwt-refresh-auth.guard, permissions.guard
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── jwt.strategy.ts
├── common/
│   └── filters/            # http-exception.filter.ts
├── cart/
│   ├── dto/                # create-cart.dto.ts, update-cart.dto.ts
│   ├── cart.controller.ts
│   ├── cart.module.ts
│   └── cart.service.ts
├── category/
│   ├── dto/                # create-category.dto.ts, update-category.dto.ts
│   ├── category.controller.ts
│   ├── category.module.ts
│   └── category.service.ts
├── comment/
│   ├── dto/                # create-comment.dto.ts, update-comment.dto.ts
│   ├── comment.controller.ts
│   ├── comment.module.ts
│   └── comment.service.ts
├── order/
│   ├── dto/                # create-order.dto.ts, update-order.dto.ts
│   ├── order.controller.ts
│   ├── order.module.ts
│   └── order.service.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── product/
│   ├── dto/                # create-product.dto.ts, product-query.dto.ts, update-product.dto.ts
│   ├── product.controller.ts
│   ├── product.module.ts
│   └── product.service.ts
├── product-photo/
│   ├── dto/                # create-product-photo.dto.ts, update-product-photo.dto.ts
│   ├── product-photo.controller.ts
│   ├── product-photo.module.ts
│   └── product-photo.service.ts
├── user/
│   ├── dto/                # create-user.dto.ts, update-user.dto.ts
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

prisma/
├── schema.prisma
└── migrations/

test/                       # e2e tests
```

## Database & Prisma

The project uses **PostgreSQL** via **Prisma ORM**. Schema file: `prisma/schema.prisma`. Generated Prisma Client output: `generated/prisma`. Migration history: `prisma/migrations`.

### Models

- `User`
- `Role`
- `RolePermission`
- `UserRoleMapping`
- `Category`
- `Product`
- `ProductPhoto`
- `ProductComment`
- `CartItem`
- `Order`
- `OrderItem`

### Enums

- `UserRole`: `USER`, `MODERATOR`, `ADMIN`
- `OrderStatus`: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`

### Table Fields

**users**
- `id`
- `name`, `surname`, `fullName` (name + surname, space-separated)
- `username`, `email`
- `password` (hashed)
- `refreshToken` (stored hashed)
- `role` (`UserRole`, default `USER`) — legacy single-role classification kept alongside the CBAC role tables
- `createdAt`, `updatedAt`

**categories**
- `id`, `name`, `slug`
- `order` (display order in API responses)
- `createdAt`, `updatedAt`

**products**
- `id`
- `categoryId` (FK → Category)
- `name`, `slug`
- `shortDescription` (shown in listing pages)
- `longDescription` (shown on the detail page)
- `price`
- `stockQuantity` (integer, added in Stage 2)
- `primaryPhotoUrl`
- `commentCount`, `averageRating`
- `createdAt`, `updatedAt`

**product_photos**
- `id`
- `productId` (FK → Product)
- `isPrimary` (exactly one photo per product must be primary)
- `url`, `size`
- `order` (display order; unique per product, no gaps skipped on delete)
- `createdAt`, `updatedAt`

**product_comments**
- `id`
- `userId` (FK → User), `productId` (FK → Product)
- `title` (nullable — but if `content` is set, `title` cannot be null)
- `content` (nullable — may be null while `title` is set, but not the other way around)
- `rating` (1–5)
- `createdAt`, `updatedAt`

**cart_items**
- `id`, `userId`, `productId`, `quantity`
- `createdAt`, `updatedAt`

**orders**
- `id`, `userId`, `totalPrice`, `status` (`OrderStatus`)
- `createdAt`, `updatedAt`

**order_items**
- `id`, `orderId`, `productId`, `quantity`, `unitPrice`
- `createdAt`, `updatedAt`

**roles** (CBAC, Stage 3)
- `id`, `name`

**roles_permissions** (CBAC, Stage 3)
- `roleId`, `permissionKey`

**users_roles** (CBAC, Stage 3)
- `userId`, `roleId`

### Core Relationships

- A `User` has a legacy single `role` enum field, and additionally can be assigned **multiple** roles through `UserRoleMapping` (`users_roles`) for the CBAC system.
- Each `Role` is linked to one or more permission keys through `RolePermission` (`roles_permissions`).
- A `Product` belongs to a `Category`, and can have multiple `ProductPhoto` and `ProductComment` entries.
- A `CartItem` links a `User` to a `Product` with a given quantity.
- An `Order` belongs to a `User` and contains multiple `OrderItem` records, each referencing a `Product`.

### Prisma Commands

```bash
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations in development
npx prisma studio        # Open Prisma Studio
```

## Authentication & Authorization

### Authentication Flow

- Authentication is based on **JWT access tokens** and **refresh tokens with rotation** (Passport.js).
- On login, a refresh token is issued and stored **hashed** in the database.
- Access tokens authorize regular API requests; refresh tokens are used solely to obtain new access tokens.
- `logout` invalidates the current refresh token; `logout-all` invalidates all active sessions for the user.
- No email/SMS verification codes are used for register or login.

### Authorization Model (CBAC)

Authorization uses a **Claims-Based Access Control (CBAC)** model with resource-first naming:

- Access rules are defined in the format **`resource:action`** (e.g. `products:create`, `orders:read:own`).
- Permissions are **hardcoded** in the codebase as a nested constant object (`PERMISSIONS`), for example:

  ```ts
  export const PERMISSIONS = {
    PRODUCTS: {
      READ: 'products:read',
      CREATE: 'products:create',
      UPDATE: 'products:update',
      DELETE: 'products:delete',
    },
    ORDERS: {
      READ_OWN: 'orders:read:own',
      READ_ANY: 'orders:read:any',
      UPDATE_OWN: 'orders:update:own',
      UPDATE_ANY: 'orders:update:any',
    },
    CARTS: {
      READ_OWN: 'carts:read:own',
      UPDATE_OWN: 'carts:update:own',
    },
    COMMENTS: {
      READ: 'comments:read',
      CREATE: 'comments:create',
      UPDATE_OWN: 'comments:update:own',
      DELETE_OWN: 'comments:delete:own',
      DELETE_ANY: 'comments:delete:any',
    },
    // ...additional resources: users, categories, product_photos
  };
  ```

- While permissions themselves are hardcoded, the **mapping of roles to permissions is managed entirely through the database** (`roles_permissions`), so a role's capabilities can change without a code deployment.
- A user can hold **multiple roles**; the effective permission set is the union of all permissions granted to those roles.
- Enforcement happens via decorators (`@Roles`, `@Permissions`) and guards (`AuthGuard`, `JwtAuthGuard`, `JwtRefreshAuthGuard`, `PermissionsGuard`); helper functions are used where decorators alone aren't sufficient for a controller's logic.
- **Stage 2 note:** the `role` enum field was added to the `users` table first (default `USER`, assignable only via direct DB access for `ADMIN`/`MODERATOR`), but was *not yet enforced* — all roles had identical access. Full enforcement was introduced only in Stage 3 with the CBAC system above.

## API Endpoints

All routes are prefixed with `/api`.

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user (defaults to `USER` role) |
| POST | `/api/auth/login` | Login and receive access/refresh tokens |
| GET | `/api/auth/me` | Get current authenticated user info |
| POST | `/api/auth/logout` | Invalidate current session's refresh token |
| POST | `/api/auth/logout-all` | Invalidate all sessions for the user |

### Users (`/api/users`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get a user by id |
| PATCH | `/api/users/:id` | Update a user |

### Categories (`/api/categories`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/categories` | Create a category |
| GET | `/api/categories` | List categories |
| GET | `/api/categories/:id` | Get a category by id |
| PATCH | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

### Products (`/api/products`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products` | Create a product (validates that the category exists) |
| GET | `/api/products` | List products, with filtering and sorting (see below) |
| GET | `/api/products/:id` | Get a product by id |
| PATCH | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

**Filtering & sorting** (via query string):

- Filter by `category_id`, `min_price` / `max_price`, minimum average rating
- Sort by price (`price:asc` / `price:desc`), rating (highest → lowest), or newest → oldest

```
GET /api/products?min_price=100&max_price=500&sort=price:asc&category_id=2
```

### Product Photos (`/api/product-photos`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/product-photos` | Add a photo to a product (`productId` + photo `data` in the request body) |
| PATCH | `/api/product-photos/:id` | Update a photo — **only** its `order` and `isPrimary` flag can be changed |
| DELETE | `/api/product-photos/:id` | Delete a photo |

Ordering rules:
- A new photo is always appended to the end (e.g. if 3 photos exist, the new one gets `order = 4`) — the client cannot choose the position on creation.
- No two photos of the same product may share the same `order` value.
- Reordering a photo requires re-adjusting the `order` of the other photos of that product accordingly; the same applies when a photo is deleted.
- If a product has any photos, exactly one of them must be marked as the primary photo (`isPrimary`), used in bulk/listing views.

### Comments (`/api/comments`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/comments` | Create a comment (open to any authenticated user — no purchase required) |
| GET | `/api/comments` | List comments, filterable by `product_id` and `rating` via query string |
| GET | `/api/comments/:id` | Get a comment by id |
| PATCH | `/api/comments/:id` | Update a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

Creating, updating, or deleting a comment automatically recalculates the related product's `averageRating` and `commentCount`.

### Cart (`/api/cart-items`)

Authenticated users only.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cart-items` | Add a product to the cart |
| GET | `/api/cart-items` | List the current user's cart |
| PATCH | `/api/cart-items/:id` | Update the quantity of a cart item |
| DELETE | `/api/cart-items/:id` | Remove an item from the cart |
| DELETE | `/api/cart-items` | Clear the entire cart |

Adding an item checks current stock availability; a product with `stockQuantity = 0` cannot be added to the cart.

### Orders (`/api/orders`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create an order from the current cart |
| GET | `/api/orders` | List orders (listing *all* orders system-wide requires `ADMIN`/`MODERATOR`) |
| GET | `/api/orders/:id` | Get an order by id |
| PATCH | `/api/orders/:id` | Update an order (e.g. its status) |

> Note: the original Stage 2 specification listed these routes under `/api/products` — this appears to be a copy-paste typo in the source document, and the implementation correctly uses `/api/orders`, matching the `order` module.

## Business Logic Highlights

- **Product creation** validates that the referenced category exists.
- **Product slugs** must be unique.
- **Product photos**: automatic append-to-end ordering, unique `order` per product, automatic re-ordering on move/delete, and a mandatory primary photo whenever photos exist.
- **Comments**: `title` and `content` are both nullable, but if `content` is provided, `title` cannot be null (the reverse — `title` set, `content` null — is allowed). Creating/updating/deleting a comment recalculates the product's average rating and comment count.
- **Cart**: only available to authenticated users; the same product can be added multiple times (implementation increases quantity rather than duplicating rows); stock is checked before adding.
- **Order creation** performs the following sequence:
  1. Validates the cart
  2. Checks stock availability for each item
  3. Calculates the total order price
  4. Creates the order
  5. Creates the corresponding order items
  6. Decreases product stock quantities (never below zero)
  7. Clears the user's cart
- **No payment processing** occurs at order creation — it is purely a data-management operation. Order status (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`) is managed separately via updates.
- **Roles & permissions**: a user's `role` enum is a coarse classification (default `USER`, admin-assignable only); real access control is enforced through the CBAC role-permission-user mapping, where a user may hold multiple roles and permissions are the union across all of them.

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL (or use the provided Docker setup)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Running the App

```bash
npm run build
npm run start
npm run start:dev     # development with watch mode
npm run start:prod    # production
```

## Running with Docker

The project includes a `docker-compose.yml` with two services:

| Service | Description | Port |
|---|---|---|
| `db` | PostgreSQL 15 | 5432 |
| `api` | NestJS application | 3000 |

Default database credentials (development):

```env
POSTGRES_USER=root
POSTGRES_PASSWORD=rootpassword
POSTGRES_DB=ecommerce_db
```

Start the stack:

```bash
docker-compose up --build
```

## Testing

```bash
npm run test        # unit tests (*.spec.ts under src/)
npm run test:e2e     # end-to-end tests (under test/)
npm run test:cov     # test coverage report
```

## Contributing & Development Notes

- Follow the existing modular structure: each domain has its own module, controller, service, and DTOs.
- Run `npm run test` and `npm run test:e2e` before submitting changes.
- Use ESLint and Prettier configurations included in the repository to keep code style consistent.
- Database schema changes should go through Prisma migrations (`npx prisma migrate dev`) rather than manual SQL.
- New permissions should be added to the hardcoded `PERMISSIONS` constant, and the role-permission mapping updated in the `roles_permissions` table — no redeploy is needed for the latter.

## Author

**Berkan Kabadayı**

## License

This project is licensed under the **MIT License**.

Copyright (c) 2026 Berkan Kabadayı

See the [LICENSE](./LICENSE) file for details.