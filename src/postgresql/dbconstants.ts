import { Pool } from "pg";
import * as dotenv from 'dotenv';

dotenv.config();


const portEnv = process.env.PORT;
const port = portEnv ? parseInt(portEnv, 10) : 5432;
const pgPool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD?.toString(),
  port: port, // Default PostgreSQL port is 5432
});



export default pgPool