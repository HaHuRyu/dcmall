import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
        //token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      //session.user.picture = token.picture;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
