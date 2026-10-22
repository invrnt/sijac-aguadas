import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler((request: Request) =>
  createAuth().handler(request),
);
