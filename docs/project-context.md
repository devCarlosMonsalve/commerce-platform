You are helping me build the backend of a new SaaS platform. Before writing or modifying code, carefully understand the project vision, architecture, and development principles described below.

# PROJECT OVERVIEW

The project is currently called "Commerce Platform" as a temporary working name. The final brand name will be decided later.

This is NOT just an e-commerce store.

The goal is to build a multi-tenant SaaS platform that acts as a centralized Commerce Operations Platform / Commerce Command Center.

Businesses should be able to manage, understand, and operate their commercial activities from one place.

The platform will eventually allow organizations to:

- Manage products and catalogs
- Manage customers
- Create and manage orders
- Manage users and teams
- Support multiple organizations (multi-tenancy)
- Control roles and permissions
- Monitor business operations
- Analyze data
- Automate workflows
- Connect with third-party systems
- Use AI to interact with business data using natural language

The platform should evolve toward this concept:

MANAGE → MONITOR → UNDERSTAND → ACT

The AI should eventually be integrated into the platform rather than being just a separate chatbot.

Examples of future AI capabilities:

- "Create an order for Carlos with 10 Coca-Cola Zero and 5 waters."
- "What are the best-selling products this month?"
- "Show me orders that require attention."
- "Summarize today's business operations."
- "Find products with declining sales."
- "Suggest a new order for this customer."

AI must never directly modify critical data without validation through the backend domain/application logic.

# CURRENT MVP SCOPE

For the first MVP, focus on the core commerce operations:

1. Organizations / Tenants
2. Users
3. Organization memberships
4. Products
5. Customers
6. Orders
7. Order items

The core business flow is:

Organization
    ↓
Users / Memberships
    ↓
Products
Customers
    ↓
Orders
    ↓
Order Items

Do NOT add unnecessary modules yet such as:

- Payments
- Invoices
- Inventory movements
- Categories
- Brands
- Advanced analytics
- AI conversations
- Integrations
- Notifications

These will be added later when the core platform is stable.

# BACKEND TECHNOLOGY

The backend should use:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Docker for local development

The backend must be designed to be scalable and production-ready.

# ARCHITECTURAL PRINCIPLES

I want to follow Clean Architecture principles and gradually apply Domain-Driven Design where it provides real value.

Avoid building a complicated enterprise architecture too early.

The architecture should prioritize:

- Clear separation of responsibilities
- Maintainability
- Scalability
- Testability
- Explicit business rules
- Framework independence where practical
- Avoiding unnecessary abstractions

Do NOT over-engineer the MVP.

Use simple and pragmatic abstractions.

The preferred request flow should generally be:

Controller
    ↓
Application / Use Case
    ↓
Domain
    ↓
Repository Interface
    ↓
Infrastructure / Prisma Repository
    ↓
PostgreSQL

Controllers should remain thin.

Controllers should NOT contain business logic.

Business rules should live in application services/use cases and domain logic where appropriate.

Prisma should not leak unnecessarily across the entire application.

# MULTI-TENANCY

Multi-tenancy is a fundamental part of the system.

The platform will support multiple organizations.

Each organization owns its own data.

Examples:

Organization A:
- Products
- Customers
- Orders
- Users through memberships

Organization B:
- Products
- Customers
- Orders
- Users through memberships

Data must always be isolated between organizations.

Never allow users from one organization to access another organization's resources.

Every tenant-owned resource should include organizationId.

Examples:

Product.organizationId
Customer.organizationId
Order.organizationId

Multi-tenant authorization must be considered in every protected resource.

# USERS AND MEMBERSHIPS

Users and organizations have a many-to-many relationship.

A user can potentially belong to multiple organizations.

Use a Membership entity to represent this relationship.

Membership should contain:

- id
- userId
- organizationId
- role
- createdAt
- updatedAt

Initial roles:

OWNER
ADMIN
MEMBER

The relationship should be:

User
    ↓
Membership
    ↓
Organization

Use a unique constraint to prevent duplicate memberships:

(userId, organizationId)

# INITIAL DATA MODEL

The initial Prisma schema should conceptually support the following models.

## Organization

Fields:

- id
- name
- slug
- memberships
- products
- customers
- orders
- createdAt
- updatedAt

The slug should be unique.

## User

Fields:

- id
- email
- name
- passwordHash
- memberships
- createdAt
- updatedAt

Email should be unique.

Authentication details may evolve later.

Do not tightly couple the entire architecture to one authentication provider.

## Membership

Fields:

- id
- userId
- organizationId
- role
- user relation
- organization relation
- createdAt
- updatedAt

Roles:

OWNER
ADMIN
MEMBER

## Product

Fields:

- id
- organizationId
- name
- description
- sku
- price
- stock
- status
- organization relation
- orderItems relation
- createdAt
- updatedAt

Initial product statuses:

ACTIVE
INACTIVE

SKU should be unique within an organization, not globally.

## Customer

Fields:

- id
- organizationId
- name
- email
- phone
- organization relation
- orders relation
- createdAt
- updatedAt

## Order

Fields:

- id
- organizationId
- customerId
- status
- total
- organization relation
- customer relation
- items relation
- createdAt
- updatedAt

Initial statuses:

DRAFT
PENDING
CONFIRMED
CANCELLED

A customer may initially be optional for an order if needed.

## OrderItem

Fields:

- id
- orderId
- productId
- quantity
- unitPrice
- total
- order relation
- product relation
- createdAt
- updatedAt

Important:

Order items should preserve the unit price at the time the order is created.

Do not depend only on the current Product.price because product prices may change later.

# DATABASE RULES

Use:

- cuid() or a consistent ID strategy
- DateTime createdAt with default(now())
- DateTime updatedAt with @updatedAt
- Decimal for monetary values
- Proper indexes
- Proper foreign keys
- Cascade deletes only where appropriate

Important constraints:

- Membership unique: userId + organizationId
- Product SKU unique per organization
- Tenant data must always be filtered by organizationId

# API DESIGN

Use REST APIs initially.

Follow clear resource naming.

Examples:

GET    /organizations
GET    /organizations/:id

GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id

GET    /customers
POST   /customers

GET    /orders
POST   /orders
GET    /orders/:id

Eventually the active organization should be determined from authentication/session context rather than trusting organizationId directly from arbitrary user input.

# ORDER BUSINESS LOGIC

Order creation should eventually work through an application use case.

Example:

CreateOrderUseCase

Responsibilities:

1. Validate organization
2. Validate customer if provided
3. Validate products
4. Validate quantities
5. Obtain current product prices
6. Create order items
7. Calculate totals
8. Persist the order

The frontend should NOT be trusted to calculate final totals.

The backend must calculate and validate:

- item totals
- order totals
- quantities
- prices

# FUTURE AI ARCHITECTURE

The system will eventually include AI capabilities.

However, do not implement AI infrastructure yet unless explicitly requested.

When AI is added, the architecture should follow this principle:

Natural language input
    ↓
AI / LLM
    ↓
Structured intent
    ↓
Validation
    ↓
Application Use Case
    ↓
Domain rules
    ↓
Database

Example:

User says:

"Create an order for Carlos with 10 Coca-Cola Zero."

The AI may convert this into structured data:

{
  "intent": "CREATE_ORDER",
  "customer": "Carlos",
  "items": [
    {
      "requestedProduct": "Coca-Cola Zero",
      "quantity": 10
    }
  ]
}

The backend must then:

- Find the actual customer
- Find the actual product
- Validate quantities
- Validate permissions
- Calculate prices
- Execute the CreateOrder use case

AI must not bypass domain rules or directly write to the database.

# FUTURE MODULES

The platform may later include:

Catalog:
- Categories
- Brands
- Product variants
- Product attributes
- Images
- Pricing

Customers:
- Companies
- Contacts
- Addresses
- Segmentation
- Customer history

Orders:
- Fulfillment
- Shipping
- Returns
- Order status workflows

Operations:
- Tasks
- Incidents
- Workflows
- Automations

Analytics:
- Sales
- Product performance
- Customer insights
- Operational metrics

Integrations:
- Shopify
- ERP systems
- CRM systems
- Marketplaces
- Webhooks
- External APIs

AI:
- Natural language commands
- Business analysis
- Recommendations
- Workflow automation
- Data summarization

Do not implement these yet. Design the architecture so they can be added cleanly later.

# DEVELOPMENT STYLE

When suggesting or writing code:

- Prefer simple solutions
- Avoid unnecessary abstractions
- Avoid premature microservices
- Keep the project as a modular monolith initially
- Keep modules independent
- Write clean TypeScript
- Use meaningful naming
- Use DTO validation
- Handle errors consistently
- Consider security and authorization
- Keep controllers thin
- Keep business logic out of Prisma repositories when possible
- Write code that is easy to test

# CURRENT DEVELOPMENT STRATEGY

We are starting from the backend foundation.

Recommended implementation order:

PHASE 1
- Project configuration
- Docker
- PostgreSQL
- Prisma
- Database connection
- Initial Prisma schema
- Initial migrations

PHASE 2
- Organization module
- User module
- Membership module
- Authentication foundation

PHASE 3
- Product module

PHASE 4
- Customer module

PHASE 5
- Order module
- Order item logic
- Order total calculation

PHASE 6
- Authorization
- Multi-tenant request context
- Role-based access control

PHASE 7
- Tests
- Documentation
- API improvements

PHASE 8
- AI capabilities
- Integrations
- Analytics
- Automations

# IMPORTANT WORKING INSTRUCTIONS

Before making significant changes:

1. Inspect the existing project structure.
2. Understand what has already been implemented.
3. Do not duplicate existing functionality.
4. Explain the proposed changes briefly.
5. Prefer incremental changes.
6. Do not rewrite working parts of the project unnecessarily.
7. If architectural decisions are needed, explain the trade-offs.
8. Always preserve the multi-tenant nature of the platform.
9. Do not over-engineer the MVP.
10. Treat this document as the primary architectural context for this project.

Your role is to act as a senior backend architect and implementation partner for this project.

Help me build the backend incrementally, explaining important architectural decisions when necessary.