#!/usr/bin/env node

/**
 * Seed script to create default users in Supabase Auth
 * Run: npx ts-node scripts/seed-users.ts
 *
 * ⚠️  SECURITY WARNING:
 * - This script generates SECURE random passwords for each user
 * - Passwords are logged to console after creation
 * - Store these passwords securely (password manager, secure vault)
 * - DELETE this script before production deployment
 * - DO NOT commit passwords to version control
 * - Change demo account passwords before go-live
 *
 * Creates:
 * - Coach: coach@example.com / [secure generated password]
 * - Client: client@example.com / [secure generated password]
 */

import { createClient } from "@supabase/supabase-js";
import { generateSecurePassword } from "../lib/password-generator";
import { logger } from "@/lib/logger";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  logger.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  logger.error("❌ Missing SUPABASE_SERVICE_KEY");
  logger.info("\nTo get the service key:");
  logger.info(
    "1. Go to Supabase Dashboard > Project Settings > API"
  );
  logger.info("2. Copy the 'service_role' key");
  logger.info("3. Add to .env.local: SUPABASE_SERVICE_KEY=<your-key>\n");
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SeedUser {
  email: string;
  name: string;
  role: 'coach' | 'client';
  userId: string;
}

async function seedUsers() {
  logger.info("🌱 Seeding default users...\n");
  logger.info("⚠️  Generating secure passwords for demo accounts...\n");

  const users: SeedUser[] = [
    {
      email: "coach@example.com",
      name: "Demo Coach",
      role: "coach",
      userId: "11111111-1111-1111-1111-111111111111",
    },
    {
      email: "client@example.com",
      name: "Demo Client",
      role: "client",
      userId: "22222222-2222-2222-2222-222222222222",
    },
  ];

  const credentials: Array<{ email: string; password: string; role: string }> = [];

  for (const user of users) {
    try {
      // Generate secure password
      const securePassword = generateSecurePassword();
      credentials.push({
        email: user.email,
        password: securePassword,
        role: user.role,
      });

      logger.info(`📧 Creating ${user.role}: ${user.email}...`);

      // Create Auth user with secure password
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: securePassword,
        email_confirm: true,
      });

      if (error) {
        logger.error(
          `   ❌ Error creating auth user: ${error.message}`
        );
        continue;
      }

      if (!data.user) {
        logger.error(`   ❌ Failed to create auth user`);
        continue;
      }

      const authUserId = data.user.id;
      logger.info(`   ✅ Auth user created: ${authUserId}`);

      // Update user profile with auth_user_id
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ auth_user_id: authUserId })
        .eq("id", user.userId);

      if (updateError) {
        logger.error(`   ❌ Error updating profile: ${updateError.message}`);
        continue;
      }

      logger.info(`   ✅ Profile updated\n`);
    } catch (error) {
      logger.error(`   ❌ Unexpected error:`, error);
    }
  }

  logger.info("✨ Seeding complete!");
  logger.info("\n" + "=".repeat(60));
  logger.info("🔐 SECURE DEMO CREDENTIALS (Save These Securely)");
  logger.info("=".repeat(60));

  credentials.forEach(({ email, password, role }) => {
    logger.info(`\n${role.toUpperCase()}`);
    logger.info(`  Email:    ${email}`);
    logger.info(`  Password: ${password}`);
  });

  logger.info("\n" + "=".repeat(60));
  logger.info("⚠️  IMPORTANT SECURITY NOTES:");
  logger.info("=".repeat(60));
  logger.info("1. Store these credentials in a secure password manager");
  logger.info("2. Delete this seed script from production");
  logger.info("3. Remove demo accounts before going live");
  logger.info("4. Change demo passwords after initial setup");
  logger.info("5. Never commit credentials to version control");
  logger.info("6. These passwords are cryptographically secure (128+ bits entropy)");
  logger.info("=".repeat(60) + "\n");
}

seedUsers().catch((error) => {
  logger.error("❌ Seeding failed:", error);
  process.exit(1);
});
