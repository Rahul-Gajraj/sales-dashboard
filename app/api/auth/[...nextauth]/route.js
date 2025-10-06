import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Do NOT set custom redirect/callback URLs here - NextAuth handles this
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow multiple Google Workspace domains
      if (account?.provider === "google") {
        const email = user.email || "";
        const allowedDomains =
          process.env.ALLOWED_GOOGLE_WORKSPACE_DOMAIN?.split(",").map((d) =>
            d.trim()
          ) || ["cronberry.com"];

        // Check if email domain is in allowed list
        const isAllowed = allowedDomains.some((domain) =>
          email.endsWith(`@${domain}`)
        );

        if (!isAllowed) {
          console.log(
            `Access denied for email: ${email}. Allowed domains: ${allowedDomains.join(
              ", "
            )}`
          );
          return false;
        }

        console.log(`Access granted for email: ${email}`);
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      // Add user info to session
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Enable debug logging for production troubleshooting
  debug: false,
});

export { handler as GET, handler as POST };
