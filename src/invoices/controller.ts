import pgPool from "../postgresql/dbconstants";
import { Router, Request, Response } from "express";
import * as Invoice from './invoiveModels'
const invoiceRouter = Router();

invoiceRouter.post("/add", async (req: Request, res: Response) => {
  const pool = pgPool;
  const client = await pool.connect(); // Acquire a client from the pool

  try {
    // Begin the transaction
    await client.query("BEGIN");
    const invoice = req.body.invoice;
    await Invoice.Invoices.createTable(client, req.body.username);
  } catch (e) {
    console.error("INternal server error");
  }
});
