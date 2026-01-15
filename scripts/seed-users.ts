#!/usr/bin/env node

/**
 * Seed script to create default users in Supabase Auth
 * Run: npx ts-node scripts/seed-users.ts
 *
 * Creates:
 * - Coach: coach@example.com / demo123
 * - Client: client@example.com / demo123
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_KEY");
  console.log("\nTo get the service key:");
  console.log(
    "1. Go to Supabase Dashboard > Project Settings > API"
  );
  console.log("2. Copy the 'service_role' key");
  console.log("3. Add to .env.local: SUPABASE_SERVICE_KEY=<your-key>\n");
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedUsers() {
  console.log("🌱 Seeding default users...\n");

  const users = [
    {
      email: "coach@example.com",
      password: "demo123",
      name: "Demo Coach",
      role: "coach",
      userId: "11111111-1111-1111-1111-111111111111",
    },
    {
      email: "client@example.com",
      password: "demo123",
      name: "Demo Client",
      role: "client",
      userId: "22222222-2222-2222-2222-222222222222",
    },
  ];

  for (const user of users) {
    try {
      console.log(`📧 Creating ${user.role}: ${user.email}...`);

      // Create Auth user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error) {
        console.error(
          `   ❌ Error creating auth user: ${error.message}`
        );
        continue;
      }

      if (!data.user) {
        console.error(`   ❌ Failed to create auth user`);
        continue;
      }

      const authUserId = data.user.id;
      console.log(`   ✅ Auth user created: ${authUserId}`);

      // Update user profile with auth_user_id
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ auth_user_id: authUserId })
        .eq("id", user.userId);

      if (updateError) {
        console.error(`   ❌ Error updating profile: ${updateError.message}`);
        continue;
      }

      console.log(`   ✅ Profile updated\n`);
    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
    }
  }

  console.log("✨ Seeding complete!");
  console.log("\n📝 Login credentials:");
  console.log("   Coach: coach@example.com / demo123");
  console.log("   Client: client@example.com / demo123\n");
}

seedUsers().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
