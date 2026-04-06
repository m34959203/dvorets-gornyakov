import { Pool } from "pg";
import * as argon2 from "argon2";

async function createAdmin() {
  const email = process.argv[2] || "admin@dvorets.kz";
  const password = process.argv[3] || "admin123456";
  const name = process.argv[4] || "Admin";

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://dvorets:dvorets_pass@localhost:5432/dvorets_db",
  });

  try {
    const hash = await argon2.hash(password);

    await pool.query(
      `INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $4`,
      [email, hash, "admin", name]
    );

    console.log(`Admin user created/updated: ${email}`);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
