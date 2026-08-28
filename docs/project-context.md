# Core Business Flows

The application has three main business flows.

---

## 1. Organization Onboarding

When a new user joins the platform:

1. The user registers.
2. A User account is created.
3. The user creates an Organization.
4. A Membership is created.
5. The user receives the OWNER role.

Result:

User
  ↓
Organization
  ↓
Membership (OWNER)

The Organization becomes the tenant context for all business operations.

---

## 2. Catalog Management

Organizations manage their commercial data.

Flow:

Organization
      ↓
Products
      ↓
Customers

Users belonging to an organization can:

### Products

- Create products
- List organization products
- Get a product
- Update products
- Deactivate products

### Customers

- Create customers
- List organization customers
- Get a customer
- Update customers

All Products and Customers belong to exactly one Organization.

Tenant isolation is mandatory.

---

## 3. Order Management

Order management is the main business workflow.

An Order belongs to:

- One Organization
- One Customer

An Order contains one or multiple OrderItems.

Flow:

Select Customer
      +
Select Products
      ↓
Create Order
      ↓
Add Order Items
      ↓
Validate Business Rules
      ↓
Calculate Total
      ↓
Save Order
      ↓
Manage Order Lifecycle

Before creating an order, the system must:

1. Resolve the current Organization.
2. Validate the Customer belongs to the current Organization.
3. Validate all Products belong to the current Organization.
4. Create the Order.
5. Add OrderItems.
6. Preserve product historical information.
7. Calculate totals using domain logic.
8. Persist the Order.

---

# Order Lifecycle

Initial Order states:

DRAFT
  ↓
PENDING
  ↓
CONFIRMED
  ↓
COMPLETED

Orders may also transition to:

CANCELLED

Allowed transitions must be controlled by domain logic.

Examples:

DRAFT → PENDING
PENDING → CONFIRMED
CONFIRMED → COMPLETED

Cancellation rules:

DRAFT → CANCELLED
PENDING → CANCELLED
CONFIRMED → CANCELLED

Controllers must never directly modify order status.

Status changes must happen through domain behavior.

Examples:

order.submit()
order.confirm()
order.complete()
order.cancel()

---

# Core Business Rules

The following rules are mandatory:

- An Order must belong to an Organization.
- A Customer used in an Order must belong to the same Organization.
- Products used in an Order must belong to the same Organization.
- An Order cannot contain invalid quantities.
- An Order cannot be confirmed without items.
- Order totals must be calculated by the domain.
- OrderItems must preserve historical product information.
- Changing a Product must not modify historical Orders.
- Invalid Order state transitions must be rejected.
- Completed or cancelled Orders cannot be modified unless explicitly allowed by domain rules.

---

# Tenant Request Flow

Every organization-owned operation follows this principle:

Authenticated User
        ↓
Resolve Current Organization
        ↓
Validate Membership
        ↓
Execute Use Case
        ↓
Access Organization Data Only

Example:

GET /products

Authenticated User
        ↓
Resolve organizationId
        ↓
Find products where:

organizationId = currentOrganizationId

The application must never expose data from another Organization.

---

# MVP User Journey

The expected MVP journey is:

1. User registers.
2. User creates an Organization.
3. User becomes Organization OWNER.
4. User creates Products.
5. User creates Customers.
6. User creates an Order.
7. User adds Products to the Order.
8. The system calculates totals.
9. The user manages the Order lifecycle.
10. The user can list and review Orders.

The primary goal of the MVP is:

A multi-tenant platform where organizations manage customers, products and the lifecycle of commercial orders.