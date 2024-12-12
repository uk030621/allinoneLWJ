import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          console.time("Database Query");
          const normalizedEmail = email.toLowerCase();
          console.timeEnd("Database Query");
          let user = await User.findOne({ email: normalizedEmail });

          if (!user) {
            // Register a new user if not found
            console.time("Bcrypt Hash");
            const hashedPassword = await bcrypt.hash(password, 10);
            console.timeEnd("Bcrypt Hash");
            user = await User.create({
              email: normalizedEmail,
              password: hashedPassword,
              name: "New User",
            });
          } else {
            // Verify existing user's password
            const passwordsMatch = await bcrypt.compare(
              password,
              user.password
            );
            if (!passwordsMatch) {
              throw new Error("Invalid email or password");
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authentication error:", error.message);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user.id to the token during sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the user's id from the token to the session object
      session.user.id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
