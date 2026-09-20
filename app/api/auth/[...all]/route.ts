import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Create async handlers that initialize auth on demand
const createHandler = (method: 'GET' | 'POST') => async (request: Request) => {
  const auth = await getAuth();
  const handlers = toNextJsHandler(auth);
  return handlers[method](request);
};

export const GET = createHandler('GET');
export const POST = createHandler('POST');

