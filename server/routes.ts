import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { extractFinancialData } from "./financialExtractor";
import fs from "fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/upload-financial-report", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const apiKey = req.headers["x-openai-api-key"] as string;
      if (!apiKey) {
        return res.status(400).json({ error: "OpenAI API key is required" });
      }

      const dataBuffer = await fs.readFile(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      const result = await extractFinancialData(pdfData.text, apiKey);

      await fs.unlink(req.file.path);

      res.json(result);
    } catch (error: any) {
      console.error("Error processing report:", error);
      res.status(500).json({ error: error.message || "Failed to process report" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
