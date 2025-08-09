import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1704000000000 implements MigrationInterface {
  name = 'InitialMigration1704000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "category_id" SERIAL PRIMARY KEY,
        "category_name" VARCHAR(100) UNIQUE NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "product_id" SERIAL PRIMARY KEY,
        "product_name" VARCHAR(200) NOT NULL,
        "category_id" INTEGER NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "stock_quantity" INTEGER DEFAULT 0,
        "description" TEXT,
        "sku" VARCHAR(50) UNIQUE NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE
      )
    `);

    // Create customers table
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "customer_id" SERIAL PRIMARY KEY,
        "first_name" VARCHAR(50) NOT NULL,
        "last_name" VARCHAR(50) NOT NULL,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "phone" VARCHAR(20),
        "address" TEXT,
        "city" VARCHAR(50),
        "state" VARCHAR(50),
        "zip_code" VARCHAR(10),
        "country" VARCHAR(50),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "order_id" SERIAL PRIMARY KEY,
        "customer_id" INTEGER NOT NULL,
        "order_date" TIMESTAMP DEFAULT NOW(),
        "status" VARCHAR(20) DEFAULT 'pending',
        "total_amount" DECIMAL(10,2) NOT NULL,
        "shipping_address" TEXT,
        "billing_address" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "order_item_id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL,
        "product_id" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_categories_name" ON "categories" ("category_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_category" ON "products" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_sku" ON "products" ("sku")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_email" ON "customers" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_customer" ON "orders" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order" ON "order_items" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_product" ON "order_items" ("product_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_order_items_product"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_order"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_email"`);
    await queryRunner.query(`DROP INDEX "IDX_products_sku"`);
    await queryRunner.query(`DROP INDEX "IDX_products_category"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_name"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}