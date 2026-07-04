// Fetch all GSD skills from open-gsd/gsd-core and combine with local skills
// Usage: node scripts/generate-skill-export.js [--fetch-gsd]

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const agentsDir = '/Users/cabebe/.agents/skills';
const opencodeDir = '/Users/cabebe/.config/opencode/skills';
const outputPath = join(root, 'public', 'folio-export-skills.json');

const shouldFetchGSD = process.argv.includes('--fetch-gsd');

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  const fm = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      const val = rest.join(':').trim().replace(/^"(.*)"$/, '$1');
      fm[key.trim()] = val;
    }
  }
  return { frontmatter: fm, body: (match[2] || '').trim() };
}

const now = new Date().toISOString();
const emptyRating = { overall: 0, clarity: 0, usefulness: 0, reusability: 0, safety: 0 };

function readSkillDirs(baseDir, sourceType, author = '') {
  const items = [];
  const entries = readdirSync(baseDir).filter(e => !e.startsWith('.'));
  for (const entry of entries) {
    const skillDir = join(baseDir, entry);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, 'SKILL.md');
    try {
      if (statSync(skillFile).isFile()) {
        const content = readFileSync(skillFile, 'utf-8');
        const { frontmatter } = extractFrontmatter(content);
        const name = frontmatter.name || entry;
        const description = frontmatter.description || '';
        const tags = [sourceType, 'skill', 'SKILL.md'];
        items.push({
          id: `skill_${sourceType}_${name.replace(/[^a-z0-9_-]/gi, '_')}`,
          title: name,
          type: 'Instruction',
          status: 'Saved',
          description: description || '',
          content,
          sourceUrl: '',
          author: author || frontmatter.author || '',
          license: frontmatter.license || '',
          tags,
          rating: { ...emptyRating },
          notes: '',
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch { /* skip */ }
  }
  return items;
}

async function fetchGSDSkills() {
  console.log('Fetching GSD skill list from GitHub API...');
  const resp = await fetch('https://api.github.com/repos/open-gsd/gsd-core/contents/skills?ref=next');
  if (!resp.ok) throw new Error(`GitHub API error: ${resp.status}`);
  const dirs = await resp.json();
  const skillDirs = dirs.filter(d => d.type === 'dir');

  const items = [];
  for (let i = 0; i < skillDirs.length; i++) {
    const dir = skillDirs[i];
    const rawUrl = `https://raw.githubusercontent.com/open-gsd/gsd-core/next/skills/${dir.name}/SKILL.md`;
    process.stdout.write(`  [${i + 1}/${skillDirs.length}] ${dir.name}... `);
    try {
      const resp = await fetch(rawUrl);
      if (!resp.ok) { console.log('SKIP'); continue; }
      const content = await resp.text();
      const { frontmatter } = extractFrontmatter(content);
      const name = frontmatter.name || dir.name;
      const description = frontmatter.description || '';
      const tags = ['gsd', 'skill', 'SKILL.md'];
      if (name.startsWith('gsd-ns-')) tags.push('gsd-namespace');
      items.push({
        id: `skill_gsd_${name.replace(/[^a-z0-9_-]/gi, '_')}`,
        title: name,
        type: 'Instruction',
        status: 'Saved',
        description: description || '',
        content,
        sourceUrl: rawUrl,
        author: 'Open GSD (open-gsd/gsd-core)',
        license: 'MIT',
        tags,
        rating: { ...emptyRating },
        notes: '',
        createdAt: now,
        updatedAt: now,
      });
      console.log('OK');
    } catch (e) {
      console.log(`ERR: ${e.message}`);
    }
  }
  return items;
}

console.log('Reading local skills...');
const agentsSkills = readSkillDirs(agentsDir, 'superpowers', 'Superpowers / Matt Pocock');
const opencodeSkills = readSkillDirs(opencodeDir, 'opencode', 'OpenCode built-in');
console.log(`  - ${agentsSkills.length} from .agents/skills`);
console.log(`  - ${opencodeSkills.length} from .config/opencode/skills`);

const allItems = [...agentsSkills, ...opencodeSkills];

if (shouldFetchGSD) {
  console.log('\nFetching GSD skills from GitHub...');
  const gsdSkills = await fetchGSDSkills();
  allItems.push(...gsdSkills);
  console.log(`  - ${gsdSkills.length} GSD skills from open-gsd/gsd-core`);
}

writeFileSync(outputPath, JSON.stringify(allItems, null, 2), 'utf-8');
console.log(`\nExported ${allItems.length} skills to ${outputPath}`);
