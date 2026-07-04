import { renderMarkdown } from '../lib/markdown';

type MarkdownPreviewProps = {
  content: string;
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return <>{renderMarkdown(content)}</>;
}
