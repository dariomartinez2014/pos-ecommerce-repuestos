-- Cada producto puede guardar varias imágenes en PostgreSQL.
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "content_type" VARCHAR(32) NOT NULL,
    "bytes" BYTEA NOT NULL,
    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
