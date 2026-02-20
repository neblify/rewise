/**
 * Scrape a URL and extract its text content.
 */
export async function scrapeUrlToText(
  url: string
): Promise<{ text: string; title: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ReWiseBot/1.0; +https://rewise.app)',
      Accept: 'text/html,application/xhtml+xml,text/plain',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch URL: ${response.status} ${response.statusText}`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const html = await response.text();

  // If plain text, return directly
  if (contentType.includes('text/plain')) {
    return { text: html.trim(), title: new URL(url).hostname };
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

  // Remove script, style, nav, header, footer tags and their content
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  // Try to extract main/article content first
  const mainMatch = cleaned.match(
    /<(?:main|article)[^>]*>([\s\S]*?)<\/(?:main|article)>/i
  );
  if (mainMatch) {
    cleaned = mainMatch[1];
  }

  // Strip all remaining HTML tags
  const text = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  return { text, title };
}
