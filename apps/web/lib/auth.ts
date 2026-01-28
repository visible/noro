import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { upload, vaultkey } from "./r2";
import { sendverification, sendreset } from "./email";

export const auth = betterAuth({
	secret: process.env.AUTH_SECRET,
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 12,
		sendResetPassword: async ({ user, url }) => {
			void sendreset(user.email, url);
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			void sendverification(user.email, url);
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 3600,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},
	appName: "noro",
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					const blobKey = vaultkey(user.id);
					const emptyVault = Buffer.from(JSON.stringify({ items: [], version: 1 }));
					await upload(blobKey, emptyVault);
					await db.vault.create({
						data: {
							userId: user.id,
							blobKey,
							revision: 1,
							size: emptyVault.length,
						},
					});
				},
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
