ALTER TABLE "products" ADD COLUMN "reference_image_sku" VARCHAR(60);

-- Los repuestos que ya tenían una imagen en Vite conservan esa referencia.
UPDATE "products" AS p
SET "reference_image_sku" = upper(btrim(p."sku"))
WHERE upper(btrim(p."sku")) IN ('FRE-001', 'FRE-002', 'FRE-0022', 'FIL-001', 'FIL-002',
    'ELE-001', 'ELE-002', 'LUB-001', 'LUB-002', 'LUB-003', 'LUB-005')
AND NOT EXISTS (SELECT 1 FROM "product_images" AS i WHERE i."product_id" = p."id");
