import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    githubLogin?: string;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubLogin?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubLogin?: string;
  }
}
