import pgPool from "../postgresql/dbconstants";
import { User, UserData } from "./usermodel";

import dotenv from "dotenv";
import express, { Request, Response } from "express";
import * as Token from "../middleware/tokenhandler";
import { hashPassword, verifyPassword } from "../id_controller/id_genrator";
dotenv.config();
const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  const pool = pgPool;
  const client = await pool.connect(); // Acquire a client from the pool

  try {
    // Begin the transaction
    await client.query("BEGIN");

    await User.createTable(client)// Use the client for the transaction

    const newUser: UserData = {
      name: req.body.name.trim(),
      username: req.body.username.trim(),
      email: req.body.email.trim(),
      password: req.body.password.trim(),
      gstIn: req.body.gstin.trim(),
      pan_card: req.body.pan.trim(),
      adhaar: req.body.aadhaar.trim(),
      phone: req.body.phone.trim(),
      address: req.body.address.trim(),
    };

    // Check if the username already exists
    const existingUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [newUser.username]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK"); // Rollback the transaction

      return res.status(409).json({ error: "Username already exists" });
    }

    // Encrypt the password
    const hashedPassword = await hashPassword(newUser.password);
    newUser.password = hashedPassword;

    // Insert the new user into the database
    await User.insertRecord(
      client,
      newUser
    );

    // Commit the transaction
    await client.query("COMMIT");


    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser, token: Token.createToken(newUser.username) });
  } catch (error) {
    console.error("Error creating user:", error);

    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");



    return res.status(500).json({ error: "Internal server error" });
  }
  finally {
    client.release(); // Release the client back to the pool
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const pool = pgPool;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { username, password } = req.body;

    const userResult = await client.query(
      "SELECT * FROM users WHERE username = $1;",
      [username]
    );
    const user = userResult.rows[0];

    // If the user does not exist
    if (!user) {
      await client.query("ROLLBACK");

      return res.status(401).json({ error: "Invalid username" });
    }

    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {
      await client.query("ROLLBACK");
      return res.status(401).json({ error: "Invalid  password" });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Login successful",
      token: Token.createToken(username),
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error logging in:", error);

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release(); // Release the client back to the pool
  }
});

export default authRouter;
