export function toRawGitHubUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('raw.githubusercontent.com')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname !== 'github.com') return trimmed;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const blobIndex = parts.indexOf('blob');
    if (blobIndex === -1 || parts.length < blobIndex + 2) return trimmed;
    const owner = parts[0];
    const repo = parts[1];
    const branch = parts[blobIndex + 1];
    const filePath = parts.slice(blobIndex + 2).join('/');
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  } catch {
    return trimmed;
  }
}

export async function fetchMarkdownFromUrl(url: string): Promise<string> {
  const rawUrl = toRawGitHubUrl(url);
  const response = await fetch(rawUrl);
  if (!response.ok) throw new Error(`Could not fetch Markdown. HTTP ${response.status}`);
  const text = await response.text();
  if (!text.trim()) throw new Error('The imported file is empty.');
  return text;
}
