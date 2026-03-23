import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || "development-secret-key-12345",
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" }, // JWT strategy necessary for credentials
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userRecord = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!userRecord || !userRecord.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          userRecord.password
        );

        if (passwordsMatch) {
          return userRecord;
        }

        return null;
      },
    }),
  ],
});
