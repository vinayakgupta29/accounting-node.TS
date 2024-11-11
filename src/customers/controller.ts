import { Router, Request, Response } from "express";
import pgPool from "../postgresql/dbconstants";
import { body, query, validationResult } from "express-validator";
import { Customer, Customers } from "./customerModel";
import { generateCustomerId } from "../id_controller/id_genrator";

const customerRouter = Router();

customerRouter.post("/add", [
    body("name").isString().trim().notEmpty().isAlphanumeric(),
    body("address").isString().trim().notEmpty().isAlphanumeric(),
    body("phone").isString().trim().notEmpty().isAlphanumeric(),
    body("email").isString().trim().notEmpty().isEmail(),
    body("gstIN").isString().trim().notEmpty().isAlphanumeric(),
    body("pan").isString().trim().notEmpty().isAlphanumeric(),
    body("aadhaar").isString().trim().notEmpty().isAlphanumeric(),
    body("dealer_type").isString().trim().isAlphanumeric(),
    body("username").isString().trim().notEmpty().isAlphanumeric(),
],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(422).json({ Errors: errors.array() });
        }
        const pool = pgPool;
        const client = await pool.connect();

        const {
            name,
            address,
            phone,
            email,
            gstIN,
            dealer_type,
            pan,
            aadhaar,
            username,
        } = req.body;
        const cust_id = await generateCustomerId(client, username);
        const customer: Customer = {
            customer_id: cust_id,
            name: name,
            address: address,
            phone_number: phone,
            email: email,
            gstIN: gstIN,
            dealer_type: dealer_type,
            pan_card: pan,
            aadhaar: aadhaar,

        }
        try {
            await client.query("BEGIN");
            await Customers.createTable(client, username);
            await Customers.insertRecord(client, username, customer);
            const response = (
                await client.query(
                    `SELECT * FROM ${username}_customers WHERE id='${cust_id}';`
                )
            ).rows;
            // Commit the transaction
            await client.query("COMMIT");


            return res
                .status(201)
                .json({ message: "customer created successfully", customer: response });
        } catch (e) {
            console.error("Error creating customer:", e);

            // Rollback the transaction in case of an error
            await client.query("ROLLBACK");


            return res.status(500).json({ error: "Internal server error" });
        } finally {
            client.release(); // Release the client back to the pool
        }
    });

customerRouter.get("/get",
    [query('username').isString().trim().isAlphanumeric()],

    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(422).json({ Errors: errors.array() });
        }
        const pool = pgPool;
        const username = req.query.username;
        const client = await pool.connect();
        try {
            await client.query('BEGIN')
            const response = (await client.query(`SELECT * FROM ${username}_customers;`)).rows;
            await client.query("COMMIT");
            return res.status(200).json({
                message: "customer fetched successfully",
                customers: response,
            })

        } catch (e) {
            console.error("Error fetching customer : ", e);
            await client.query("ROLLBACK");
            return res.status(500).json({ error: "Internal server error" });
        } finally {
            client.release(); // Release the client back to the pool}
        }
    });
export default customerRouter;
