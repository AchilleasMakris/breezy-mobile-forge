// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Hello from Functions!")

// Optional: verify Clerk webhook signature
const verifySignature = async (req: Request): Promise<Response | null> => {
  const secret = Deno.env.get('CLERK_WEBHOOK_SECRET');
  if (!secret) return null; // signature checking disabled

  const signature = req.headers.get('Webhook-Signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const body = await req.text();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const rawSig = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));
  const expected = Array.from(rawSig).map(b => b.toString(16).padStart(2, '0')).join('');

  if (expected !== signature) return new Response('Invalid signature', { status: 401 });

  // recreate request with consumed body for downstream processing
  return new Response(body, { headers: req.headers });
};

serve(async (req) => {
  // signature verification (optional)
  const verifiedReq = await verifySignature(req);
  if (verifiedReq instanceof Response) return verifiedReq; // signature error
  if (verifiedReq) req = new Request(req.url, { ...req, body: verifiedReq.body });

  // Parse Clerk payload
  let payload: any;
  try {
    payload = await req.json();
  } catch (_) {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (payload?.type !== 'user.created') return new Response('ignored', { status: 200 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  const { id, first_name, last_name, email_addresses } = payload.data;
  const { error } = await supabase.from('profiles').insert({
    id,
    first_name,
    last_name,
    email: email_addresses?.[0]?.email_address ?? null,
  });

  if (error) {
    return new Response(`db error: ${error.message}`, { status: 500 });
  }

  return new Response('ok', { status: 200 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/clerk-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
