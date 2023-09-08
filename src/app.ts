import { NextFunction } from "express";
import { Pool } from "pg";
import pgPool from "./postgresql/dbconstants";
import authRoute from "./auth/controller";

import express from "express";
import inventoryRouter from "./inventory-management/controller";
const port = 420;
const app = express();


app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});

app.use(express.json());


app.use("/auth", authRoute);
app.use("/inventory", inventoryRouter);
