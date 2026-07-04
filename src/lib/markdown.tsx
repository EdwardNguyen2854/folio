import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|!\[[^\]]*\]\([^\s)]+\)|\[[^\]]+\]\([^\s)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={`${match.index}-code`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('![')) {
      const closeBracket = token.indexOf(']');
      const alt = token.slice(2, closeBracket);
      const src = token.slice(closeBracket + 2, -1);
      nodes.push(<img key={`${match.index}-img`} src={src} alt={alt} />);
    } else {
      const label = token.slice(1, token.indexOf(']'));
      const href = token.slice(token.indexOf('(') + 1, -1);
      nodes.push(
        <a key={`${match.index}-link`} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>,
      );
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function parseTable(lines: string[], start: number): { node: ReactNode; next: number } | null {
  if (start + 1 >= lines.length) return null;
  const header = lines[start];
  const divider = lines[start + 1];
  if (!header.includes('|') || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(divider)) return null;

  const split = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  const headers = split(header);
  const rows: string[][] = [];
  let index = start + 2;
  while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
    rows.push(split(lines[index]));
    index += 1;
  }

  return {
    next: index,
    node: (
      <table key={`table-${start}`}>
        <thead>
          <tr>{headers.map((cell, i) => <th key={i}>{inline(cell)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    ),
  };
}

export function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let index = 0;
  let inCode = false;
  let codeLanguage = '';
  let codeLines: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let orderedList: string[] = [];
  let inFrontmatter = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(<p key={`p-${nodes.length}`}>{inline(paragraph.join(' '))}</p>);
    paragraph = [];
  };

  const flushList = () => {
    if (list.length) {
      nodes.push(<ul key={`ul-${nodes.length}`}>{list.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>);
      list = [];
    }
    if (orderedList.length) {
      nodes.push(<ol key={`ol-${nodes.length}`}>{orderedList.map((item, i) => <li key={i}>{inline(item)}</li>)}</ol>);
      orderedList = [];
    }
  };

  const flushCode = () => {
    nodes.push(
      <pre key={`code-${nodes.length}`} data-language={codeLanguage || undefined}>
        <code>{codeLines.join('\n')}</code>
      </pre>,
    );
    codeLines = [];
    codeLanguage = '';
  };

  while (index < lines.length) {
    const line = lines[index];

    if (index === 0 && line.trim() === '---') {
      inFrontmatter = true;
      index += 1;
      continue;
    }

    if (inFrontmatter) {
      if (line.trim() === '---') inFrontmatter = false;
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLanguage = line.replace('```', '').trim();
      }
      index += 1;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      index += 1;
      continue;
    }

    const table = parseTable(lines, index);
    if (table) {
      flushParagraph();
      flushList();
      nodes.push(table.node);
      index = table.next;
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (level === 1) nodes.push(<h1 key={`h-${index}`} id={id}>{inline(text)}</h1>);
      if (level === 2) nodes.push(<h2 key={`h-${index}`} id={id}>{inline(text)}</h2>);
      if (level === 3) nodes.push(<h3 key={`h-${index}`} id={id}>{inline(text)}</h3>);
      if (level === 4) nodes.push(<h4 key={`h-${index}`} id={id}>{inline(text)}</h4>);
      if (level === 5) nodes.push(<h5 key={`h-${index}`} id={id}>{inline(text)}</h5>);
      if (level === 6) nodes.push(<h6 key={`h-${index}`} id={id}>{inline(text)}</h6>);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      nodes.push(<blockquote key={`quote-${index}`}>{inline(line.replace(/^>\s?/, ''))}</blockquote>);
      index += 1;
      continue;
    }

    if (/^\s*[-*_](?:\s*[-*_]){2,}\s*$/.test(line)) {
      flushParagraph();
      flushList();
      nodes.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    const unordered = /^\s*[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      flushParagraph();
      orderedList = [];
      list.push(unordered[1]);
      index += 1;
      continue;
    }

    const ordered = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      flushParagraph();
      list = [];
      orderedList.push(ordered[1]);
      index += 1;
      continue;
    }

    paragraph.push(line.trim());
    index += 1;
  }

  if (inCode) flushCode();
  flushParagraph();
  flushList();
  return nodes;
}

export function extractTitle(markdown: string): string | null {
  const heading = markdown.split(/\r?\n/).find((line) => /^#\s+/.test(line));
  return heading ? heading.replace(/^#\s+/, '').trim() : null;
}
