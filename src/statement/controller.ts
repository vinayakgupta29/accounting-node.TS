import express, { Request, Response } from "express";
import { cleanAlphanumeric } from "../server-security/server-security";
import pgPool from "../postgresql/dbconstants";
import { InvoiceActions, invoiceActions } from "../invoices/ctrlFunc";
import util from 'util'
import zlib from 'zlib'
import { query, validationResult } from "express-validator";

const statementRouter = express.Router();

statementRouter.get("/get",
    [query("username").trim().customSanitizer(cleanAlphanumeric).isString()],
    async (req: Request, res: Response) => {
        const username: string = req.query.username as string;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(422).json({ Errors: errors.array() });
        }
        const pool = pgPool;
        const client = await pool.connect();
        try {
            let sdate;
            let endate;
            if (req.query.sdate && req.query.endate) {
                sdate = new Date(req.query.sdate as string).toISOString();
                endate = new Date(req.query.endate as string).toISOString();
            } else {
                sdate = new Date().toISOString();
                endate = new Date().toISOString();
            }
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
                )} JOIN ${username}_customers AS cu on inv.customer_id=cust_id;`
            const response = await client.query(sql);
            const responseData = response.rows;
            await client.query("COMMIT");

            const compressedData = await util.promisify(zlib.gzip)(
                JSON.stringify({ invoices: responseData })
            );

            res.setHeader("Content-Encoding", "gzip");
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Vary", "Accept-Encoding");
            res.setHeader("Content-Length", compressedData.length);
            console.info(responseData)
            res.status(200).end(compressedData);

        } catch (e) {
            await client.query("ROLLBACK");

            console.error("error Getting invoices", e);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            client.release();
        }
    })

export default statementRouter