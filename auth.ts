import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true, // Trust the host in development and production
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.adminUser.findUnique({
                    where: {
                        email: credentials.email as string,
                        isActive: true
                    },
                });

                if (!user) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValidPassword) {
                    return null;
                }

                // Update last login
                await prisma.adminUser.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                });

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    pages: {
        signIn: '/admin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 1 hour
    },
    secret: process.env.NEXTAUTH_SECRET,
});
