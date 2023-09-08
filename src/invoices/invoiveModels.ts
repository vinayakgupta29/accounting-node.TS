import { PoolClient } from "pg";
interface Invoice {

  customer_id: string,
  transaction_id: string,
  date_time: string,
  total: number,
  total_discount: number,
  packaging: number,
  freight: number,
  taxable_amount: number,
  tax_collected_at_source: number,
  round_off: number,
  grand_total: number,
  method_of_payment: string
}
const Invoices = {
  createTable: async function (client: PoolClient, username: string) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}invoices (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(256) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    total_discount DECIMAL(10,2) NOT NULL,
    packaging DECIMAL(10,2) NOT NULL,
    freight DECIMAL(10,2) NOT NULL,
    taxable_amount DECIMAL(10,2) NOT NULL,
    tax_collected_at_source DECIMAL(10,2) NOT NULL,
    round_off DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    method_of_payment VARCHAR(25) NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES ${username}_customers (id)
  );`;
    await client.query(sql);
  },
  insertRecord: async function (
    client: PoolClient, invoiceData: Invoice
  ) {
    const {
      customer_id,
      transaction_id,
      date_time,
      total,
      total_discount,
      packaging,
      freight,
      taxable_amount,
      tax_collected_at_source,
      round_off,
      grand_total,
      method_of_payment } = invoiceData;
    const sql = `INSERT INTO invoices (customer_id, transaction_id, date_time, total, total_discount, packaging, freight, taxable_amount, tax_collected_at_source, round_off, grand_total, method_of_payment)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
    await client.query(sql, [
      customer_id,
      transaction_id,
      date_time,
      total,
      total_discount,
      packaging,
      freight,
      taxable_amount,
      tax_collected_at_source,
      round_off,
      grand_total,
      method_of_payment,
    ]);
  },
};

interface InvoiceLine {

  username: string,
  invoice_id: string,
  product_id: string,
  quantity: number,
  amount: number
}

const InvoiceLines = {
  createTable: async function (client: PoolClient, username: string) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_invoice_lines (
      id SERIAL PRIMARY KEY,
      invoice_id VARCHAR(256) NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (product_id) REFERENCES ${username}_inventory (id)
    );`;
    await client.query(sql);
  },
  //      FOREIGN KEY (invoice_id) REFERENCES ${username}_invoices (id),

  insertRecord: async function (
    client: PoolClient, invoicelinedata: InvoiceLine
  ) {
    const {
      username,
      invoice_id,
      product_id,
      quantity,
      amount } = invoicelinedata
    const sql = `INSERT INTO ${username}_invoice_lines (invoice_id, product_id,  quantity,  amount)
    VALUES ($1, $2, $3, $4)`;
    await client.query(sql, [invoice_id, product_id, quantity, amount]);
  },
};

export { Invoice, Invoices, InvoiceLine, InvoiceLines };
