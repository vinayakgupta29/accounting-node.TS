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

    const newProduct: Product = {
      username: req.body.username,
      product_name: req.body.product_name,
      quantity: req.body.quantity,
      unit_price: req.body.unit_price,
    };
    await Products.createTable(client, newProduct.username);
    const result = await Products.insertRecord(
      client,
      newProduct
    );

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
