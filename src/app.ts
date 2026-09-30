import authRoute from "./auth/controller";
import invoiceRoute from './invoices/controller'
import express from "express";
import inventoryRouter from "./inventory-management/controller";
import customerRouter from "./customers/controller";
import statementRouter from "./statement/controller";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger";

const port = 420;
const app = express();

app.use(express.json());

// Swagger documentation route
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRoute);
app.use("/inventory", inventoryRouter);
app.use("/invoice", invoiceRoute);
app.use("/stmt", statementRouter)
app.use("/customer", customerRouter);

const server = app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});
process.stdin.resume()

