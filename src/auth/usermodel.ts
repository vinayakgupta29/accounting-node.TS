import { PoolClient } from "pg";

interface UserData {
  name: string;
  username: string;
  password: string;
  email: string;
  gstIn: string;
  phone: string;
  address: string;
  pan_card: string;
  adhaar: string;
}

const User = {
  createTable: async function (client: PoolClient) {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        gstIn VARCHAR(100) NOT NULL,
        pan_card VARCHAR(50) NOT NULL,
        adhaar VARCHAR(50) NOT NULL,
        phone VARCHAR (13) NOT NULL,
        address TEXT NOT NULL
    );`;
      await client.query(sql);
    } catch (e) {
      console.error("An error in Creating User table", e);
    }
  },

  insertRecord: async function (
    client: PoolClient,
    userData: UserData
  ) {
    try {
      const { name, username, password, email, gstIn, phone, address, pan_card, adhaar } = userData;
      const sql = `INSERT INTO users (name, username, password, gstIn, pan_card, adhaar, phone, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      await client.query(sql, [
        name,
        username,
        password,
        gstIn,
        phone,
        address,
        pan_card,
        adhaar,
      ]);
      console.log("User Created");
    } catch (e) {
      console.error("error in INserting to User Table", e);
    }
  },
};

export { User, UserData }