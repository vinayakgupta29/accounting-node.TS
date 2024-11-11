import pgPool from "../postgresql/dbconstants";
import { Router, Request, Response } from "express";
import util from 'util'
import zlib from 'zlib'
import { query, validationResult } from 'express-validator'
import * as Invoice from './invoiveModels'
import { generateInvoiceId } from "../id_controller/id_genrator";
import { InvoiceActions, invoiceActions } from "./ctrlFunc";
import { cleanAlphanumeric } from "../server-security/server-security";
const invoiceRouter = Router();


invoiceRouter.post("/add", async (req: Request, res: Response) => {
  const pool = pgPool;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const username = req.body.username;
    const invoice = req.body.invoice;

    if (!invoice.date_time) {
      invoice.date_time = new Date();
    } else {
      invoice.date_time = invoice.date_time;
    }
    await Invoice.Invoices.createTable(client, username);
    invoice.transaction_id = await generateInvoiceId(client, username)
    await Invoice.Invoices.insertRecord(client, username, invoice);
    const invoiceLines = req.body.invoice.invoiceLines;
    for (let doc of invoiceLines) {
      const unit_price = (
        await client.query(
          `SELECT unit_price FROM ${username}_inventory WHERE id=$1;`,
          [doc.product_id]
        )
      ).rows[0];
      doc.amount = unit_price.unit_price * doc.quantity; // Access the unit_price value
      await Invoice.InvoiceLines.createTable(client, username);
      await Invoice.InvoiceLines.insertRecord(
        client,
        username,
        invoice.transaction_id,
        doc
      );
    }

    // Commit the transaction
    await client.query("COMMIT");

    return res
      .status(201)
      .json({ message: "invoice created successfully", invoice: invoice });
  } catch (e) {
    console.error("Error creating invoice:", e);

    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");

    return res.status(500).json({ error: "Internal server error " + e });
  } finally {
    client.release(); // Release the client back to the pool
  }
});

invoiceRouter.get(
  "/get",
  [query("username").trim().customSanitizer(cleanAlphanumeric).isString()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(422).json({ Errors: errors.array() });
    }
    const pool = pgPool;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      let sdate;
      let endate;
      if (req.query.sdate && req.query.endate) {
        sdate = new Date(req.query.sdate as string).toISOString();
        endate = new Date(req.query.endate as string).toISOString();
      } else {
        sdate = new Date().toISOString();
        endate = new Date().toISOString();
      }
      const username = req.query.username;
      const action = req.query.action as string;
      const sql = `SELECT * ,json_build_object(
        'cust_id', cu.cust_id,
        'name', cu.name,
        'address', cu.address,
        'phone_number', cu.phone_number,
        'email', cu.email,
        'gstin', cu.gstin,
        'dealer_type', cu.dealer_type,
        'pan_card', cu.pan_card,
        'aadhaar', cu.aadhaar
      ) AS customer_id FROM ${username}_invoices AS inv ${invoiceActions[
          action as keyof InvoiceActions
        ](
          sdate,
          endate
        )} JOIN ${username}_customers AS cu on inv.customer_id=cust_id;`; //`BETWEEN '${sdate}' AND '${endate}';`; // WHERE date_time BETWEEN ${sdate} AND ${endate}
      const response = await client.query(sql);
      const responseData = response.rows;
      for (let i = 0; i < responseData.length; i++) {
        const element = responseData[i];

        element.lines = [];
        //SQL Query to find the invoice lines of a given invoiceID;
        const sql1 = `SELECT p.product_name AS contents, p.unit_price, il.quantity, il.amount FROM ${username}_invoice_lines AS il
         JOIN ${username}_inventory AS p ON p.id = il.product_id
         WHERE il.invoice_id='${element.transaction_id}';`;
        const res = await client.query(sql1);
        element.lines.push(res.rows);
      }
      await client.query("COMMIT");
      const compressedData = await util.promisify(zlib.gzip)(
        JSON.stringify({ invoices: responseData })
      );

      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Content-Length", compressedData.length);
      return res.status(200).end(compressedData);
    } catch (e) {
      await client.query("ROLLBACK");

      console.error("error Getting invoices", e);
      return res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);


export default invoiceRouter;
