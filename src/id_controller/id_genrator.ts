import { PoolClient } from "pg";

async function generateCustomerId(client: PoolClient, username: string): Promise<string> {
    let id = await client.query(`SELECT id FROM ${username}_customers;`);
    let uniqueId;
    if (id.rowCount === 0) {
        uniqueId = (1).toString().padStart(3, "0");
    } else {
        uniqueId = (id.rowCount + 1).toString().padStart(3, "0");
    }
    return `cust_${uniqueId}`;
}


async function generateInvoiceId(client: PoolClient, username: string) {
    const date = new Date().toISOString();
    const date0: string = date.replace(/[^0-9]/g, "");
    const response = await client.query(
        `SELECT date_time,transaction_id FROM ${username}_invoices ORDER BY date_time DESC LIMIT 50;`
    );
    let date1: number = parseFloat(date0.padEnd(23, "0"));
    for (const i of response.rows) {
        let count = 0;
        const date2: String = (i.date_time).toISOString().replace(/[^0-9]/g, "");

        if (date2 === date0) {
            date1 += count;
            if (date1 === i.transaction_id.subString(4)) {
                date1 += 1;
            }
            count++;
        }
    }
    return `txn_${date1}`;
}

export { generateCustomerId, generateInvoiceId }
