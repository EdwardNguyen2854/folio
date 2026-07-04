import type { FolioItem } from '../types';
import { nowIso } from './dates';

const createdAt = nowIso();

export const sampleItems: FolioItem[] = [
  {
    id: 'sample_research_brief',
    title: 'Research Brief Builder',
    type: 'Instruction',
    lifecycle: 'active',
    flags: { isFavorite: true, isProductionReady: false },
    description: 'A reusable instruction for turning scattered source notes into a concise research brief.',
    content: `---\nname: research-brief-builder\ndescription: Convert rough notes into a structured research brief.\n---\n\n# Research Brief Builder\n\nUse this when the user has collected raw notes, links, or excerpts and wants a clean brief.\n\n## Instructions\n\n1. Identify the main question.\n2. Group notes into themes.\n3. Separate facts, assumptions, and open questions.\n4. Produce a concise brief with next actions.\n\n## Output\n\n- Summary\n- Key findings\n- Evidence table\n- Risks and gaps\n- Recommended next steps\n`,
    sourceUrl: 'https://github.com/example/research-brief-builder/SKILL.md',
    author: 'Example Author',
    license: 'MIT',
    tags: ['research', 'brief', 'markdown'],
    rating: { overall: 4.5, clarity: 5, usefulness: 5, reusability: 4, safety: 4 },
    notes: 'Good structure. Could add stricter citation rules before real use.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'sample_code_review',
    title: 'Code Review Checklist',
    type: 'Template',
    lifecycle: 'active',
    flags: { isFavorite: false, isProductionReady: false },
    description: 'A Markdown checklist for reviewing frontend code changes.',
    content: `# Code Review Checklist\n\n## Correctness\n\n- Does the change solve the stated problem?\n- Are edge cases handled?\n- Are errors shown clearly?\n\n## Maintainability\n\n- Is the code easy to read?\n- Are names specific and consistent?\n- Can this be tested in isolation?\n\n## UX\n\n- Does the empty state work?\n- Does the loading state work?\n- Does it respect system theme?\n`,
    tags: ['coding', 'review', 'frontend'],
    rating: { overall: 4, clarity: 4, usefulness: 4, reusability: 5, safety: 3 },
    notes: 'Useful as a starting point. Add security section later.',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'sample_meeting_digest',
    title: 'Meeting Digest Format',
    type: 'Note',
    lifecycle: 'active',
    flags: { isFavorite: false, isProductionReady: false },
    description: 'A compact structure for converting meeting notes into actions and decisions.',
    content: `# Meeting Digest\n\n## Decisions\n\n| Decision | Owner | Date |\n| --- | --- | --- |\n| TBD | TBD | TBD |\n\n## Actions\n\n- [ ] Action item — owner — due date\n\n## Risks\n\n> Capture unresolved risks here.\n\n## Follow-up Questions\n\n1. What still needs clarification?\n2. Who needs to approve the next step?\n`,
    tags: ['meeting', 'ops', 'template'],
    rating: { overall: 3.5, clarity: 4, usefulness: 3, reusability: 4, safety: 3 },
    notes: 'Simple but practical.',
    createdAt,
    updatedAt: createdAt,
  },
];
