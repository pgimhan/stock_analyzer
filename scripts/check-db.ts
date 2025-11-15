import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { users } from "../shared/db-schema";
import { sql } from "drizzle-orm";

async function checkDatabase() {
  try {
    console.log("🔍 Checking database connection...");
    
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful");
    
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user'
      );
    `);
    
    const tableExists = result.rows[0]?.exists;
    
    if (tableExists) {
      console.log("✅ Users table exists");
      const userCount = await db.select().from(users);
      console.log(`📊 Total users: ${userCount.length}`);
    } else {
      console.log("❌ Users table does not exist");
      console.log("💡 Run: npm run db:push");
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database check failed:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. DATABASE_URL is set in .env");
    console.log("   2. Database is accessible");
    console.log("   3. Run: npm run db:push");
    process.exit(1);
  }
}

checkDatabase();
