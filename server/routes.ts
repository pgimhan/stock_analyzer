import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, analyses } from "../shared/db-schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({
        email,
        password: hashedPassword,
        name: name || null,
      }).returning();

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/session", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = req.cookies?.['authjs.session-token'] || req.cookies?.['__Secure-authjs.session-token'];
      
      if (!token) {
        return res.json(null);
      }
      
      // For now, return null - session will be handled client-side after login
      res.json(null);
    } catch (error) {
      res.json(null);
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (!user?.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    res.json({ success: true });
  });

  // Analysis routes
  app.post("/api/analyses", async (req, res) => {
    try {
      const { userId, stockName, tickerSymbol, inputData, result } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const [analysis] = await db.insert(analyses).values({
        userId,
        stockName,
        tickerSymbol,
        inputData: JSON.stringify(inputData),
        result: JSON.stringify(result),
      }).returning();

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analyses/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const userAnalyses = await db.query.analyses.findMany({
        where: eq(analyses.userId, userId),
        orderBy: [desc(analyses.createdAt)],
      });

      const formatted = userAnalyses.map(a => ({
        id: a.id,
        stockName: a.stockName,
        tickerSymbol: a.tickerSymbol,
        inputData: JSON.parse(a.inputData),
        result: JSON.parse(a.result),
        timestamp: a.createdAt,
      }));

      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/analyses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(analyses).where(eq(analyses.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin route
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany();
      const allAnalyses = await db.query.analyses.findMany();
      
      const usersWithStats = allUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.emailVerified || new Date(),
        analysisCount: allAnalyses.filter(a => a.userId === user.id).length,
      }));

      res.json({
        users: usersWithStats,
        stats: {
          totalUsers: allUsers.length,
          totalAnalyses: allAnalyses.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
