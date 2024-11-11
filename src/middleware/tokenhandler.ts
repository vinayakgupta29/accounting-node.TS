import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"; // Import JwtPayload type
import { Pool } from "pg";

var maxage = 1 * 60 * 60;
const tokenEnv: any = process.env.TOKEN_KEY;

declare global {
  namespace Express {
    interface Request {
      user: any; // Define the type of 'user' property here
    }
  }
}

const createToken = (usrname: string) => {
  return jwt.sign({ username: usrname }, tokenEnv, {
    expiresIn: "1h",
  });
};

function reNewToken(oldToken: string) {
  // Verify the old token and extract the payload and expiration time
  const decoded: JwtPayload = jwt.verify(oldToken, tokenEnv) as JwtPayload; // Specify JwtPayload type here
  const payload = { username: decoded.username };

  // Generate a new token with the same payload and expiration time
  const newToken = jwt.sign(payload, tokenEnv, {
    expiresIn: "1h",
  });

  return newToken;
}

const authenticateToken = (pgPool: Pool) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization"); // Assuming the token is sent in the "Authorization" header

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }
    const client = await pgPool.connect();
    try {
      const decoded: any = jwt.verify(token, tokenEnv);

      // Assuming you have a 'users' table with a 'username' column in your database

      const userQuery = "SELECT * FROM users WHERE username = $1";
      const { rows } = await client.query(userQuery, [decoded.username]);


      if (rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }

      // Attach the decoded payload to the request for use in other middleware or routes
      req.user = decoded;

      // Continue to the next middleware or route
      next();
    } catch (error) {
      console.error("Error authenticating token:", error);
      return res.status(401).json({ error: "Invalid token" });
    } finally {
      client.release(); // Release the client back to the pool
    }
  };
};


export { createToken, reNewToken, authenticateToken };
