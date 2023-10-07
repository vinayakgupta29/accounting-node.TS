import { PoolClient } from "pg";

interface Product {
  product_name: string,
  quantity: number,
  unit_price: number

}
const Products = {
  createTable: async function (client: PoolClient, username: string) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_inventory (
        id SERIAL PRIMARY KEY,
        product_name TEXT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL);`;
    await client.query(sql);
  },
  insertRecord: async function (
    client: PoolClient, username: string, product: Product
  ) {
    const sql = `INSERT INTO ${username}_inventory ( product_name, quantity, unit_price)
      VALUES ($1, $2, $3)`;
    await client.query(sql, [product.product_name, product.quantity, product.unit_price]);
  },
};

export { Products, Product };
