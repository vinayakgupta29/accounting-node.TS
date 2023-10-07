import { Request, Response, Router } from "express";
import { Product, Products } from "./inventoryModel";
import pgPool from "../postgresql/dbconstants";


const inventoryRouter = Router();

inventoryRouter.post("/add", async (req: Request, res: Response) => {

  const pool = pgPool;
  const client = await pool.connect();
  try {

    // Begin the transaction
    await client.query("BEGIN");// Acquire a client from the pool
    const { username, product_name, quantity, unit_price } = req.body;
    const newProduct: Product = {
      product_name: product_name,
      quantity: quantity,
      unit_price: unit_price,
    };
    await Products.createTable(client, username);
    const result = await Products.insertRecord(client, username, newProduct);

    // Commit the transaction
    await client.query("COMMIT");

    client.release(); // Release the client back to the pool

    res.status(200).json({ result: result, messge: "Product added" });
  } catch (e) {
    console.error("Error adding Products to table", e);
    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");

    client.release(); // Release the client back to the pool

    res.status(500).json({ error: "Invernal server error" });
  }
});

export default inventoryRouter;
