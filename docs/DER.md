# Diagrama entidad-relación

12 tablas con tipos, llaves y cardinalidades. GitHub representa el bloque Mermaid; diagrama.dbml es la versión editable para dbdiagram.io.

~~~mermaid
erDiagram
  users {
    int id PK
    varchar_150 name
    varchar_254 email UK
    varchar_30 phone "nullable"
    varchar_255 password_hash
    UserRole role
    boolean active
    timestamptz created_at
  }
  categories {
    int id PK
    varchar_100 name UK
    boolean active
  }
  products {
    int id PK
    int category_id FK
    varchar_60 sku UK
    varchar_150 name
    text description "nullable"
    decimal_12_2 acquisition_cost
    decimal_12_2 sale_price
    int stock
    boolean active
    timestamptz created_at
  }
  addresses {
    int id PK
    int user_id FK
    varchar_150 recipient_name
    varchar_30 phone
    text address_line
    text reference "nullable"
  }
  carts {
    int id PK
    int created_by_id FK
    int customer_id FK "nullable"
    SalesChannel channel
    CartStatus status
    timestamptz created_at
  }
  cart_items {
    int id PK
    int cart_id FK
    int product_id FK
    int quantity
  }
  cash_sessions {
    int id PK
    int opened_by_id FK
    int closed_by_id FK "nullable"
    decimal_12_2 opening_amount
    decimal_12_2 counted_amount "nullable"
    decimal_12_2 expected_amount "nullable"
    timestamptz opened_at
    timestamptz closed_at "nullable"
  }
  orders {
    int id PK
    varchar_60 receipt_number UK
    varchar_100 idempotency_key UK
    int cart_id FK,UK "nullable"
    int customer_id FK "nullable"
    int created_by_id FK
    int cash_session_id FK "nullable"
    SalesChannel channel
    OrderStatus status
    decimal_12_2 total
    varchar_150 recipient_name "nullable"
    varchar_30 recipient_phone "nullable"
    text delivery_address "nullable"
    text delivery_reference "nullable"
    timestamptz created_at
    timestamptz updated_at
  }
  order_items {
    int id PK
    int order_id FK
    int product_id FK
    varchar_150 product_name
    int quantity
    decimal_12_2 unit_price
    decimal_12_2 unit_cost
  }
  payments {
    int id PK
    int order_id FK,UK
    int recorded_by_id FK
    PaymentMethod method
    decimal_12_2 amount
    varchar_150 reference "nullable"
    timestamptz paid_at
  }
  inventory_movements {
    int id PK
    int product_id FK
    int order_id FK "nullable"
    int actor_id FK
    MovementType type
    int quantity_delta
    text reason "nullable"
    timestamptz created_at
  }
  gateway_attempts {
    text id PK
    int order_id FK
    text gateway_id UK "nullable"
    text checkout_url "nullable"
    varchar_20 status
    timestamptz created_at
    timestamptz updated_at
  }
  categories ||--o{ products : "categoryId"
  users ||--o{ addresses : "userId"
  users ||--o{ carts : "createdById"
  users o|--o{ carts : "customerId"
  carts ||--o{ cart_items : "cartId"
  products ||--o{ cart_items : "productId"
  users ||--o{ cash_sessions : "openedById"
  users o|--o{ cash_sessions : "closedById"
  carts o|--o| orders : "cartId"
  users o|--o{ orders : "customerId"
  users ||--o{ orders : "createdById"
  cash_sessions o|--o{ orders : "cashSessionId"
  orders ||--o{ order_items : "orderId"
  products ||--o{ order_items : "productId"
  orders ||--o| payments : "orderId"
  users ||--o{ payments : "recordedById"
  products ||--o{ inventory_movements : "productId"
  orders o|--o{ inventory_movements : "orderId"
  users ||--o{ inventory_movements : "actorId"
  orders ||--o{ gateway_attempts : "orderId"
~~~

Carrito–pedido y pedido–pago son uno a cero o uno. Los pares carrito/producto y pedido/producto son únicos. Enums en el schema; CHECK e índice parcial de caja en la migración.
