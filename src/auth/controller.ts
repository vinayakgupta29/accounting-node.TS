import pgPool from "../postgresql/dbconstants";
import { User, UserData } from "./usermodel";

require("dotenv").config();
import bcrypt from "bcrypt";
import express from "express";
import { Request, Response } from "express";

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
      client.release(); // Release the client back to the pool
      return res.status(409).json({ error: "Username already exists" });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    // Insert the new user into the database
    await User.insertRecord(
      client,
      newUser
    );

    // Commit the transaction
    await client.query("COMMIT");

    client.release(); // Release the client back to the pool

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);

    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");

    client.release(); // Release the client back to the pool

    res.status(500).json({ error: "Internal server error" });
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
      client.release();
      return res.status(401).json({ error: "Invalid username" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(401).json({ error: "Invalid  password" });
    }

    await client.query("COMMIT");
    client.release();
    res.status(200).json({
      message: "Login successful",
      token: Token.createToken(username),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    console.error("Error logging in:", error);

    res.status(500).json({ error: "Internal server error" });
  }
});

export default authRouter;
