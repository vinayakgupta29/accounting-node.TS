import { PoolClient } from "pg";
import argon2 from 'argon2';

// Function to hash a password
const hashPassword = async (password: string): Promise<string> => {
    try {
        // Hashing the password using Argon2id
        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id, // Use Argon2id for better security
            memoryCost: 2 ** 16,     // Memory cost (adjust for your needs)
            timeCost: 3,            // Time cost (number of iterations)
            parallelism: 1,         // Parallelism (threads)
        });
        return hashedPassword;
    } catch (err: any) {
        throw new Error('Error hashing password: ' + err.message);
    }
};

// Function to verify a password against a stored hash
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        // Verifying the password
        const isValid = await argon2.verify(hash, password);
        return isValid;
    } catch (err: any) {
        throw new Error('Error verifying password: ' + err.message);
    }
};

async function generateCustomerId(client: PoolClient, username: string): Promise<string> {
    let id = await client.query(`SELECT id FROM ${username}_customers;`);
    let uniqueId;
    if (id.rowCount === 0) {
        uniqueId = (1).toString().padStart(3, "0");
    } else {
        uniqueId = (id.rowCount ?? 0 + 1).toString().padStart(3, "0");
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

export { generateCustomerId, generateInvoiceId, hashPassword, verifyPassword }
