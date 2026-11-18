-- La foto principal es opcional y su selección se limpia en cuanto se quita la foto.
ALTER TABLE "products" ADD COLUMN "primary_image_id" INTEGER;
ALTER TABLE "products" ADD CONSTRAINT "products_primary_image_id_fkey"
    FOREIGN KEY ("primary_image_id") REFERENCES "product_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
