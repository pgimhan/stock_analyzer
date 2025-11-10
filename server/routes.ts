import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { extractFinancialData } from "./financialExtractor";
import fs from "fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ dest: "/tmp/uploads/" });

// Ensure tmp directory exists
try {
  await fs.mkdir('/tmp/uploads', { recursive: true });
} catch (e) {
  console.log('Tmp directory already exists or created');
}

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

      console.log('Processing file:', req.file.originalname, 'Size:', req.file.size);
      
      const dataBuffer = await fs.readFile(req.file.path);
      console.log('File read successfully, parsing PDF...');
      
      const pdfData = await pdfParse(dataBuffer);
      console.log('PDF parsed, text length:', pdfData.text.length);
      
      const result = await extractFinancialData(pdfData.text, apiKey);
      console.log('Financial data extracted successfully');

      // Clean up temp file
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        console.warn('Failed to delete temp file:', e);
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error processing report:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "Failed to process report" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
