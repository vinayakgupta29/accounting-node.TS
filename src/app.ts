import authRoute from "./auth/controller";
import invoiceRoute from './invoices/controller'
import express from "express";
import inventoryRouter from "./inventory-management/controller";
import customerRouter from "./customers/controller";
import statementRouter from "./statement/controller";
const port = 420;
const app = express();

app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});

app.use(express.json());

app.use("/auth", authRoute);
app.use("/inventory", inventoryRouter);
app.use("/invoice", invoiceRoute);
app.use("/stmt", statementRouter)
app.use("/customer", customerRouter);
