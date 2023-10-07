import { Pool, PoolClient } from "pg";
interface Customer {
  customer_id: string
  name: string,
  address: string,
  phone_number: string,
  email: string,
  gstIN: string,
  dealer_type: string,
  pan_card: string,
  aadhaar: string,
}

const Customers = {
  createTable: async function (client: PoolClient, username: string) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_customers (
      id SERIAL PRIMARY KEY,
      cust_id TEXT UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      phone_number VARCHAR(13) NOT NULL,
      email VARCHAR(255) NOT NULL,
      gstIN VARCHAR(255) NOT NULL UNIQUE,
      dealer_type VARCHAR(255) NOT NULL,
      pan_card VARCHAR(255) NOT NULL,
      aadhaar VARCHAR(255) NOT NULL
    );`;
    await client.query(sql);
  },

  insertRecord: async function (
    client: PoolClient,
    username: String,
    custData: Customer,
  ) {
    const {
      customer_id,
      name,
      address,
      phone_number,
      email,
      gstIN,
      dealer_type,
      pan_card,
      aadhaar,
    } = custData;
    const sql = `INSERT INTO ${username}_customers (cust_id, name, address, phone_number, email, gstIN, dealer_type, pan_card, aadhaar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await client.query(sql, [
      customer_id,
      name,
      address,
      phone_number,
      email,
      gstIN,
      dealer_type,
      pan_card,
      aadhaar,
    ]);

  },
};

export { Customers, Customer }
