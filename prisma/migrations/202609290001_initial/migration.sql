-- ESTRUCTURA: tablas, enums y relaciones de POS & E-commerce.

-- No modifica datos existentes: migración inicial para una base nueva.

CREATE TYPE "user_role" AS ENUM ('ADMIN', 'CASHIER', 'CUSTOMER');

CREATE TYPE "sales_channel" AS ENUM ('POS', 'WEB', 'SOCIAL');

CREATE TYPE "order_status" AS ENUM ('PENDING', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'COMPLETED');

CREATE TYPE "cart_status" AS ENUM ('OPEN', 'CONVERTED', 'ABANDONED');

CREATE TYPE "payment_method" AS ENUM ('CASH', 'CARD', 'TRANSFER');

CREATE TYPE "movement_type" AS ENUM ('INITIAL', 'RESTOCK', 'SALE', 'CANCELLATION', 'ADJUSTMENT');

CREATE TABLE "users" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(150) NOT NULL,
  "email" VARCHAR(254) NOT NULL UNIQUE,
  "phone" VARCHAR(30),
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "user_role" NOT NULL DEFAULT 'CUSTOMER',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "categories" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "products" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "category_id" INTEGER NOT NULL,
  "sku" VARCHAR(60) NOT NULL UNIQUE,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "acquisition_cost" DECIMAL(12,2) NOT NULL,
  "sale_price" DECIMAL(12,2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "addresses" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "recipient_name" VARCHAR(150) NOT NULL,
  "phone" VARCHAR(30) NOT NULL,
  "address_line" TEXT NOT NULL,
  "reference" TEXT
);

CREATE TABLE "carts" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "created_by_id" INTEGER NOT NULL,
  "customer_id" INTEGER,
  "channel" "sales_channel" NOT NULL,
  "status" "cart_status" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "cart_items" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "cart_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id")
);

CREATE TABLE "cash_sessions" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "opened_by_id" INTEGER NOT NULL,
  "closed_by_id" INTEGER,
  "opening_amount" DECIMAL(12,2) NOT NULL,
  "counted_amount" DECIMAL(12,2),
  "expected_amount" DECIMAL(12,2),
  "opened_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  "closed_at" TIMESTAMPTZ(3)
);

CREATE TABLE "orders" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "receipt_number" VARCHAR(60) NOT NULL UNIQUE,
  "idempotency_key" VARCHAR(100) NOT NULL UNIQUE,
  "cart_id" INTEGER UNIQUE,
  "customer_id" INTEGER,
  "created_by_id" INTEGER NOT NULL,
  "cash_session_id" INTEGER,
  "channel" "sales_channel" NOT NULL,
  "status" "order_status" NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  "recipient_name" VARCHAR(150),
  "recipient_phone" VARCHAR(30),
  "delivery_address" TEXT,
  "delivery_reference" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "order_items" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "product_name" VARCHAR(150) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "unit_cost" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "order_items_order_id_product_id_key" UNIQUE ("order_id", "product_id")
);

CREATE TABLE "payments" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "order_id" INTEGER NOT NULL UNIQUE,
  "recorded_by_id" INTEGER NOT NULL,
  "method" "payment_method" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "reference" VARCHAR(150),
  "paid_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE TABLE "inventory_movements" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "product_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "actor_id" INTEGER NOT NULL,
  "type" "movement_type" NOT NULL,
  "quantity_delta" INTEGER NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "carts" ADD CONSTRAINT "carts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_opened_by_id_fkey" FOREIGN KEY ("opened_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_closed_by_id_fkey" FOREIGN KEY ("closed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_cash_session_id_fkey" FOREIGN KEY ("cash_session_id") REFERENCES "cash_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- INTEGRIDAD: restricciones que complementan el schema Prisma.
ALTER TABLE products ADD CONSTRAINT products_amounts_check CHECK (stock >= 0 AND acquisition_cost >= 0 AND sale_price > 0);
ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_check CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT order_items_amounts_check CHECK (quantity > 0 AND unit_price > 0 AND unit_cost >= 0);
ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount > 0);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_nonzero_check CHECK (quantity_delta <> 0);
ALTER TABLE cash_sessions ADD CONSTRAINT cash_amounts_check CHECK (opening_amount >= 0 AND (counted_amount IS NULL OR counted_amount >= 0) AND (expected_amount IS NULL OR expected_amount >= 0));
ALTER TABLE cash_sessions ADD CONSTRAINT cash_closure_check CHECK ((closed_at IS NULL AND closed_by_id IS NULL AND counted_amount IS NULL AND expected_amount IS NULL) OR (closed_at IS NOT NULL AND closed_by_id IS NOT NULL AND counted_amount IS NOT NULL AND expected_amount IS NOT NULL AND closed_at >= opened_at));
-- Una sola caja física: como máximo una fila cumple closed_at IS NULL.
CREATE UNIQUE INDEX cash_one_open ON cash_sessions ((1)) WHERE closed_at IS NULL;
ALTER TABLE orders ADD CONSTRAINT orders_total_check CHECK (total > 0);
ALTER TABLE orders ADD CONSTRAINT orders_channel_check CHECK ((channel = 'POS' AND cash_session_id IS NOT NULL AND status = 'COMPLETED') OR (channel IN ('WEB','SOCIAL') AND cash_session_id IS NULL AND status <> 'COMPLETED' AND recipient_name IS NOT NULL AND recipient_phone IS NOT NULL AND delivery_address IS NOT NULL));
ALTER TABLE orders ADD CONSTRAINT orders_web_customer_check CHECK (channel <> 'WEB' OR customer_id IS NOT NULL);
-- ÍNDICES: aceleran las búsquedas habituales y las referencias de las relaciones.
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX orders_customer_id_created_at_idx ON orders(customer_id, created_at);
CREATE INDEX orders_channel_status_created_at_idx ON orders(channel, status, created_at);
CREATE INDEX orders_cash_session_id_idx ON orders(cash_session_id);
CREATE INDEX addresses_user_id_idx ON addresses(user_id);
CREATE INDEX inventory_movements_product_id_created_at_idx ON inventory_movements(product_id, created_at);
