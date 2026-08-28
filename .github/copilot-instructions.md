# GitHub Copilot Instructions

## Project Context

Before making significant architectural or implementation decisions, read:

docs/project-context.md

This file is the source of truth for:

- Project vision
- Architecture
- Domain model
- Business flows
- Business rules
- Module boundaries
- Multi-tenancy
- MVP scope

Do not make architectural decisions that contradict the project context.

---

# Project Architecture

This project is a:

- Modular Monolith
- Multi-tenant SaaS
- NestJS backend
- TypeScript application
- Domain-Driven Design (DDD)
- Clean Architecture

The application must remain simple, modular and maintainable.

Do not introduce unnecessary complexity.

---

# Modular Monolith Rules

The application is a single deployable backend.

Modules are organized by business domain.

Current modules:

- identity
- organizations
- products
- customers
- orders
- shared

Modules should have clear responsibilities.

Avoid tightly coupling modules.

Do not introduce microservices.

---

# Module Architecture

Each important business module follows Clean Architecture.

Preferred structure:

module/

├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── value-objects/
│   └── errors/
│
├── application/
│   ├── use-cases/
│   └── dto/
│
├── infrastructure/
│   └── persistence/
│
└── presentation/
    ├── controllers/
    └── module.ts

Not every folder must exist if it is not needed.

Avoid creating empty abstractions.

---

# Dependency Rules

Dependency direction must be respected:

Presentation
      ↓
Application
      ↓
Domain

Infrastructure implements contracts required by the Domain or Application layers.

The Domain layer must never depend on:

- NestJS
- Prisma
- PostgreSQL
- HTTP
- Controllers
- DTOs
- Framework-specific code

The Domain must remain framework-independent.

---

# Domain Rules

Use DDD pragmatically.

Use:

- Entities when identity and business behavior matter.
- Value Objects when they provide meaningful validation or behavior.
- Repository interfaces for persistence boundaries.
- Use Cases for application workflows.
- Domain methods for important business rules.

Do not create abstractions only for architectural appearance.

Avoid unnecessary:

- Factories
- Builders
- Commands
- Command Handlers
- Events
- Event Sourcing
- CQRS
- Aggregates
- Value Objects
- Generic base classes

Only introduce these patterns when they solve a real problem.

---

# Core Entities

The current core entities are:

- User
- Organization
- Membership
- Product
- Customer
- Order
- OrderItem

Do not add new major entities or domains without explicit instruction.

---

# Multi-Tenancy

Multi-tenancy is mandatory.

Organization is the tenant boundary.

Organization-owned entities include:

- Product
- Customer
- Order

Every organization-owned entity must belong to an Organization.

Always consider organizationId when:

- Creating data
- Reading data
- Updating data
- Deleting data

Never implement queries that could expose data from another organization.

Tenant isolation must always be enforced.

Expected request flow:

Authenticated User
        ↓
Resolve Current Organization
        ↓
Validate Membership
        ↓
Execute Use Case
        ↓
Access Organization Data Only

A user from Organization A must never access data from Organization B.

---

# Membership Rules

Membership represents the relationship between:

User
↓
Organization

Initial roles:

- OWNER
- ADMIN
- MEMBER

A user may belong to multiple organizations.

Do not assume a User belongs to only one Organization.

Always validate the active Membership when accessing organization data.

---

# Controllers

Controllers must remain thin.

Controllers are responsible for:

- Receiving HTTP requests
- Validating input through DTOs
- Calling Application Use Cases
- Returning responses

Controllers must not contain:

- Business rules
- Complex workflows
- Prisma queries
- Domain logic

---

# Use Cases

Use Cases represent application workflows.

Examples:

- CreateProduct
- UpdateProduct
- CreateCustomer
- CreateOrder
- AddOrderItem
- ConfirmOrder
- CancelOrder

Use Cases should:

- Coordinate the workflow
- Resolve dependencies
- Call repositories
- Invoke domain behavior
- Validate application-level rules

Business behavior should not be duplicated between controllers and use cases.

---

# Domain Entities

Domain entities should protect important business rules.

Example:

Order behavior should be expressed through methods such as:

- addItem()
- removeItem()
- submit()
- confirm()
- complete()
- cancel()
- calculateTotal()

Do not expose domain entities as simple mutable data containers when behavior belongs to the domain.

Avoid allowing arbitrary state changes.

---

# Order Rules

Order management is the main business domain.

An Order:

- Belongs to one Organization.
- Belongs to one Customer.
- Contains one or multiple OrderItems.

When creating an Order:

1. Resolve the current Organization.
2. Validate the Customer belongs to the current Organization.
3. Validate all Products belong to the current Organization.
4. Create the Order.
5. Add OrderItems.
6. Calculate totals.
7. Preserve historical product information.
8. Persist the Order.

OrderItems must preserve historical information including:

- Product ID
- Product name
- Unit price
- Quantity
- Subtotal

Changing a Product must never modify historical Orders.

---

# Order State Management

Initial Order states:

- DRAFT
- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED

Order state transitions must be controlled by domain logic.

Do not allow arbitrary status changes directly from:

- Controllers
- DTOs
- Database updates

Use explicit domain behavior:

order.submit()
order.confirm()
order.complete()
order.cancel()

Invalid transitions must throw domain errors.

Completed and cancelled Orders must not be modified unless explicitly allowed by business rules.

---

# Repository Rules

Repositories represent persistence boundaries.

The Domain must depend on repository abstractions, not Prisma implementations.

Expected flow:

Domain Entity
      ↓
Repository Interface
      ↓
Repository Implementation
      ↓
Prisma
      ↓
PostgreSQL

Do not expose Prisma models directly to the Domain.

Use mappers when necessary between:

- Domain entities
- Persistence models

---

# Prisma Rules

Prisma is an infrastructure concern.

Prisma must not be used directly inside:

- Domain entities
- Domain services

Prisma queries should live inside Infrastructure repositories.

Avoid spreading Prisma queries across multiple layers.

---

# API Rules

Typical request flow:

HTTP Request
      ↓
Controller
      ↓
DTO Validation
      ↓
Use Case
      ↓
Domain Logic
      ↓
Repository
      ↓
Prisma
      ↓
PostgreSQL

Keep this flow clear and predictable.

---

# Code Quality

Prioritize:

1. Correctness
2. Simplicity
3. Tenant isolation
4. Domain clarity
5. Maintainability
6. Testability
7. Scalability

Prefer simple solutions over clever solutions.

Prefer explicit code over unnecessary abstraction.

---

# Before Implementing Changes

Before implementing a significant feature:

1. Read docs/project-context.md.
2. Inspect the existing code.
3. Identify the affected module.
4. Identify the affected domain entities.
5. Check multi-tenant implications.
6. Identify business rules.
7. Design the smallest correct solution.
8. Preserve existing architecture.
9. Avoid unrelated refactors.

---

# Scope Control

Do not implement new major functionality unless explicitly requested.

Current MVP modules:

- identity
- organizations
- products
- customers
- orders

Do not add new business domains without explicit instruction.

---

# Currently Out of Scope

Do not implement unless explicitly requested:

- LLM
- AI assistants
- Chat
- RAG
- Agents
- Categories
- Brands
- Suppliers
- Inventory
- Inventory movements
- Payments
- Invoices
- Shipping
- Addresses
- Notifications
- Analytics
- Reporting
- Microservices
- CQRS
- Event sourcing
- Message brokers
- Complex permission systems
- Feature flags

---

# Refactoring Rules

Do not refactor unrelated code.

Before changing existing architecture:

1. Explain the reason.
2. Identify the impact.
3. Preserve existing behavior.
4. Prefer incremental changes.

Avoid large rewrites when a small change solves the problem.

---

# Development Philosophy

The project should demonstrate professional software engineering without unnecessary complexity.

The main principles are:

- Build a working product.
- Keep the architecture understandable.
- Protect business rules.
- Enforce tenant isolation.
- Keep modules independent.
- Use DDD pragmatically.
- Use Clean Architecture pragmatically.
- Avoid over-engineering.

Architecture exists to support the product.

Do not sacrifice simplicity for architectural purity.