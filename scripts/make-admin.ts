import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import { User } from "../models/User";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: pnpm make-admin <email>");
    process.exit(1);
  }

  await connectToDatabase();
  const result = await User.updateOne({ email }, { $set: { role: "admin" } });

  if (result.matchedCount === 0) {
    console.error(`No user found with email "${email}". Register that account first.`);
  } else {
    console.log(`✓ "${email}" is now an admin. They must log out and back in to refresh their token.`);
  }

  await mongoose.disconnect();
  process.exit(result.matchedCount === 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
