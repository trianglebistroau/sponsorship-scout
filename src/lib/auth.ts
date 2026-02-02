// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  //avoid table name collisions + avoid using "user"
  user: { modelName: "app_user" },
  session: { modelName: "app_session" },
  account: { modelName: "app_account" },
  verification: { modelName: "app_verification" },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
    allowDifferentEmails: false,
  },
});
