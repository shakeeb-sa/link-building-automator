/**
 * Converts HTML to Markdown (inline links, bold, italic).
 * Supports: <a href="url">text</a> → [text](url)
 *           <b>/<strong> → **text**
 *           <i>/<em> → *text*
 */
export function htmlToMarkdown(html: string): string {
  let result = html;

  // Replace links
  result = result.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_, href, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    return `[${cleanText}](${href})`;
  });

  // Bold/strong
  result = result.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '**$1**');
  // Italic/em
  result = result.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '*$1*');

  // Replace <br> with newline
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining HTML tags
  result = result.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  result = result.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return result.trim();
}

/**
 * Converts HTML to BBCode.
 * Supports: <a href="url">text</a> → [url=url]text[/url]
 *           <b>/<strong> → [b]text[/b]
 *           <i>/<em> → [i]text[/i]
 */
export function htmlToBBCode(html: string): string {
  let result = html;

  // Replace links
  result = result.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_, href, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    return `[url=${href}]${cleanText}[/url]`;
  });

  // Bold/strong
  result = result.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '[b]$1[/b]');
  // Italic/em
  result = result.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '[i]$1[/i]');

  // Replace <br> with newline
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining HTML tags
  result = result.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  result = result.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return result.trim();
}

/**
 * Converts HTML to plain text (no formatting, no links, just text with line breaks).
 */
export function htmlToPlainText(html: string): string {
  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Replace <br> and block elements with newlines
  temp.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  temp.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li').forEach(block => {
    block.insertAdjacentText('afterend', '\n');
  });

  // Extract text content
  let text = temp.textContent || '';

  // Clean up multiple newlines
  text = text.replace(/\n\s*\n/g, '\n\n').trim();

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text;
}

/**
 * Converts HTML to raw text with links in [URL text] format.
 * Example: <a href="https://example.com">Example</a> → [https://example.com Example]
 */
export function htmlToRawText(html: string): string {
  let result = html;

  // Replace links with [URL text]
  result = result.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_, href, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    return `[${href} ${cleanText}]`;
  });

  // Remove all other HTML tags
  result = result.replace(/<[^>]*>/g, '');

  // Replace newlines and spaces
  result = result.replace(/\s+/g, ' ').trim();

  // Decode HTML entities
  result = result.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return result;
}

/**
 * Basic Markdown to HTML conversion (supports links, bold, italic).
 * Not exhaustive but sufficient for the extension's needs.
 */
export function markdownToHtml(markdown: string): string {
  let result = markdown;

  // Inline code (optional, but safe)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  result = result.replace(/__([^_]+)__/g, '<b>$1</b>');

  // Italic: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  result = result.replace(/_([^_]+)_/g, '<i>$1</i>');

  // Convert newlines to <br>
  result = result.replace(/\n/g, '<br>');

  return result;
}

/**
 * Basic BBCode to HTML conversion (supports url, b, i).
 */
export function bbcodeToHtml(bbcode: string): string {
  let result = bbcode;

  // [url=url]text[/url]
  result = result.replace(/\[url=([^\]]+)\](.*?)\[\/url\]/gi, '<a href="$1">$2</a>');
  // [url]url[/url] (no label)
  result = result.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1">$1</a>');

  // [b]text[/b]
  result = result.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
  // [i]text[/i]
  result = result.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');

  // Convert newlines to <br>
  result = result.replace(/\n/g, '<br>');

  return result;
}