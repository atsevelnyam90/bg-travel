// Check the URLs the embedded trip page actually uses on the production server.
// The development server can serve filenames that production URL matching rejects.
const origin = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
const templateUrl = new URL("/travel-detail/index.html", origin);

async function getText(url, contentType) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.headers.get("content-type")?.includes(contentType)) {
    throw new Error(`${url.pathname}: HTTP ${response.status}, expected ${contentType}`);
  }
  const body = await response.text();
  if (!body.trim()) throw new Error(`${url.pathname}: empty response`);
  return body;
}

try {
  const html = await getText(templateUrl, "text/html");
  const styles = new Set();
  for (const [tag, href] of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    if (!/\brel=["'][^"']*\bstylesheet\b/i.test(tag)) continue;
    const url = new URL(href, templateUrl);
    if (!/\/wp-content\/themes\/blacktomato\/dist\/css\/(base|current)[^/]*\.css$/.test(url.pathname)) continue;
    if (url.origin !== origin.origin) throw new Error("Trip theme stylesheet must be served locally");
    styles.add(url.href);
  }
  if (styles.size !== 2) throw new Error("Expected both base and current trip theme stylesheets");
  for (const href of styles) {
    const url = new URL(href);
    await getText(url, "text/css");
    console.log(`Trip stylesheet OK: ${url.pathname}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Trip stylesheet check failed");
  process.exitCode = 1;
}
