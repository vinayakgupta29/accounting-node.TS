import { Pool, PoolClient } from "pg";
interface Customer {

  name: string,
  address: string,
  phone_number: string,
  email: string,
  gstIN: string,
  dealer_type: string,
  pan_card: string,
  aadhaar: string,
  user_id: string
}

const Customers = {
  createTable: async function (client: PoolClient, username: string) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        gstIN VARCHAR(255) NOT NULL UNIQUE,
        dealer_type VARCHAR(255) NOT NULL,
        pan_card VARCHAR(255) NOT NULL,
        aadhaar VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`;
    await client.query(sql);
  },

  insertRecord: async function (
    client: PoolClient,
    custData: Customer
  ) {
    const {
      name,
      address,
      phone_number,
      email,
      gstIN,
      dealer_type,
      pan_card,
      aadhaar,
      user_id
    } = custData;
    const sql = `INSERT INTO customers (name, address, phone_number, email, gstIN, dealer_type, pan_card, aadhaar, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await client.query(sql, [
      name,
      address,
      phone_number,
      email,
      gstIN,
      dealer_type,
      pan_card,
      aadhaar,
      user_id,
    ]);

  },
};

export { Customers, Customer }
