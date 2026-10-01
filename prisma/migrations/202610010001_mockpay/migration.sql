-- PASARELA: correlación persistente e índice parcial para un único intento activo por pedido.
CREATE TABLE gateway_attempts (
  id UUID PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  gateway_id TEXT UNIQUE,
  checkout_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'CREATING',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  CONSTRAINT gateway_attempts_status_check CHECK (status IN ('CREATING','PENDING','UNKNOWN','FAILED','SUCCEEDED'))
);
CREATE INDEX gateway_attempts_order_id_idx ON gateway_attempts(order_id);
CREATE UNIQUE INDEX gateway_one_active_order ON gateway_attempts(order_id) WHERE status IN ('CREATING','PENDING','UNKNOWN');

