/* eslint-disable @typescript-eslint/no-require-imports -- Explicit read-only integration diagnostic. */
// Run separately from unit tests. Prints counts/statuses, never credentials,
// review text, customer identities, storage paths, or signed URLs.
require('@next/env').loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

function failure(error) {
  const details = [error?.code, error?.message, error?.details, error?.cause?.code].join(' ');
  const networkCode = details.match(/\b(EACCES|EPERM|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|UND_ERR_CONNECT_TIMEOUT)\b/)?.[0];
  return networkCode || (/timeout|abort/i.test(details) ? 'TIMEOUT' : 'REQUEST_FAILED');
}

(async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NOT_CONFIGURED');
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
  });
  // Same public eligibility and column contract as getApprovedReviews.
  const { data, error, status, count } = await client.from('reviews')
    .select('id, display_name, rating, review_text, service_label, location_text, is_verified_customer, media_path, created_at, approved_at', { count: 'exact' })
    .eq('status', 'approved').eq('consent_to_publish', true)
    .order('approved_at', { ascending: false }).limit(6);
  if (error) {
    console.log(JSON.stringify({ stage: 'database', status, error: failure(error) }));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({ stage: 'database', status, approvedWithConsent: count, returned: data.length }));
  const mediaResults = await Promise.all(data.filter(row => row.media_path).map(async row => {
    try {
      // Minting a short-lived read URL does not change a row or stored object.
      const signed = await client.storage.from('review-media').createSignedUrl(row.media_path, 60);
      if (signed.error || !signed.data?.signedUrl) return { ok: false, stage: 'sign', error: failure(signed.error) };
      // Read the body too: HEAD 200 does not prove a photo can be downloaded.
      const response = await fetch(signed.data.signedUrl, { signal: AbortSignal.timeout(45000) });
      const bytes = (await response.arrayBuffer()).byteLength;
      const image = response.headers.get('content-type')?.startsWith('image/');
      return { ok: response.ok && Boolean(image) && bytes > 0, stage: 'media', status: response.status, bytes };
    } catch (error) {
      return { ok: false, stage: 'media', error: failure(error) };
    }
  }));
  console.log(JSON.stringify({ stage: 'complete', databaseStatus: status, approvedWithConsent: count, returned: data.length, media: mediaResults }, null, 2));
  if (mediaResults.some(result => !result.ok)) process.exitCode = 1;
})().catch(error => {
  console.log(JSON.stringify({ stage: 'diagnostic', error: error.message === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : failure(error) }));
  process.exitCode = 1;
});
