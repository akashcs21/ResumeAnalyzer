export const authConfig = {
  secret: process.env.AUTH_SECRET || "development-secret-key-12345",
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [], // configured in auth.js
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/chat");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // If logged in and trying to access /login or /signup, redirect to dashboard
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }
      return true;
    },
    session({ session, user, token }) {
      // Expose the user ID to the session
      if (session.user && user) {
        session.user.id = user.id;
      } else if (session.user && token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
