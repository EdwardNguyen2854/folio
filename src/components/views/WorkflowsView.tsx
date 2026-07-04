import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowSquareOut, BookOpen, Copy, GithubLogo, UserCircle, X } from '@phosphor-icons/react';

// ─── Data Types ──────────────────────────────────────────

type SkillDef = {
  id: string;
  label: string;
  description: string;
  key?: boolean;
};

type PhaseDef = {
  id: string;
  label: string;
  color: string;
  skills: SkillDef[];
};

type AuthorLink = { label: string; url: string };

type WorkflowAuthor = {
  name: string;
  handle?: string;
  bio: string;
  links: AuthorLink[];
};

type WorkflowDef = {
  id: string;
  label: string;
  description: string;
  principles: string[];
  author: WorkflowAuthor;
  sourceUrl: string;
  phases: PhaseDef[];
};

// ─── Node & Edge types (positioned on canvas) ────────────

type Node = {
  id: string;
  type: 'phase' | 'skill';
  label: string;
  description: string;
  color: string;
  phaseId: string;
  workflowId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  key?: boolean;
};

type Edge = {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// ─── Workflow Definitions ────────────────────────────────

const WORKFLOW_DATA: WorkflowDef[] = [
  {
    id: 'matt-pocock',
    label: 'Matt Pocock Skills',
    description: 'Skills for Real Engineers — straight from Matt Pocock\'s .claude directory. These are the engineering practices he uses every day to ship production software, not vibe-coded prototypes. The philosophy: software-engineering fundamentals matter more than ever. First, alignment between you and the agent through grilling sessions. Second, a shared domain language that drops verbosity session after session. Third, tight red-green-refactor feedback loops so the agent can\'t fly blind. Fourth, caring about the design of the system every day to keep entropy in check. The skills are small, composable, model-agnostic, and built to be hacked on.',
    principles: ['Alignment first', 'Shared language', 'Red-green-refactor', 'Deep modules', 'Vertical slices', 'Mandatory workflows'],
    author: {
      name: 'Matt Pocock',
      handle: '@mattpocockuk',
      bio: 'TypeScript wizard. Building Total TypeScript — a comprehensive, production-grade TypeScript course. Ex-Vercel, Stately.',
      links: [
        { label: 'GitHub', url: 'https://github.com/mattpocock' },
        { label: 'Total TypeScript', url: 'https://totaltypescript.com' },
      ],
    },
    sourceUrl: 'https://github.com/mattpocock/skills',
    phases: [
      {
        id: 'mp-setup',
        label: 'Setup',
        color: '#d97757',
        skills: [
          { id: 'mp-setup-1', label: '/setup-matt-pocock-skills', description: 'Configure this repo for the engineering skills: issue tracker, triage labels, domain doc layout. Run once per repo.', key: true },
          { id: 'mp-setup-2', label: '/setup-pre-commit', description: 'Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.' },
        ],
      },
      {
        id: 'mp-discover',
        label: 'Discover',
        color: '#6a9bcc',
        skills: [
          { id: 'mp-discover-1', label: '/improve-codebase-architecture', description: 'Scan codebase for deepening opportunities. Generates an HTML report you grill through.', key: true },
          { id: 'mp-discover-2', label: '/diagnosing-bugs', description: 'Disciplined diagnosis loop: reproduce → minimise → hypothesise → instrument → fix → regression-test.' },
        ],
      },
      {
        id: 'mp-design',
        label: 'Design',
        color: '#b8942e',
        skills: [
          { id: 'mp-design-1', label: '/grill-with-docs', description: 'Grilling session that also builds the project domain model and writes ADRs inline.', key: true },
          { id: 'mp-design-2', label: '/codebase-design', description: 'Shared discipline for designing deep modules: a lot of behaviour behind a small interface, at a clean seam.' },
          { id: 'mp-design-3', label: '/domain-modeling', description: 'Actively build and sharpen a project domain model. Challenge terms against the glossary.' },
          { id: 'mp-design-4', label: '/prototype', description: 'Build a throwaway prototype to flesh out a design — a runnable terminal app or several UI variants.' },
        ],
      },
      {
        id: 'mp-plan',
        label: 'Plan',
        color: '#d97757',
        skills: [
          { id: 'mp-plan-1', label: '/to-prd', description: 'Turn the current conversation into a PRD and publish it to the issue tracker. No interview.', key: true },
          { id: 'mp-plan-2', label: '/to-issues', description: 'Break any plan, spec, or PRD into independently-grabbable issues using vertical slices.', key: true },
          { id: 'mp-plan-3', label: '/ask-matt', description: 'Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.' },
          { id: 'mp-plan-4', label: '/grill-me', description: 'Get relentlessly interviewed about a plan or design until every branch is resolved.' },
        ],
      },
      {
        id: 'mp-build',
        label: 'Build',
        color: '#5a8f6a',
        skills: [
          { id: 'mp-build-1', label: '/tdd', description: 'Test-driven development with a red-green-refactor loop. One vertical slice at a time.', key: true },
          { id: 'mp-build-2', label: '/handoff', description: 'Compact the current conversation into a handoff document so another agent can continue.' },
        ],
      },
      {
        id: 'mp-review',
        label: 'Review',
        color: '#6a9bcc',
        skills: [
          { id: 'mp-review-1', label: '/triage', description: 'Move issues and external PRs through a state machine of triage roles.', key: true },
        ],
      },
      {
        id: 'mp-maintain',
        label: 'Maintain',
        color: '#d97757',
        skills: [
          { id: 'mp-maintain-1', label: '/teach', description: 'Teach the user a new skill or concept over multiple sessions, using the directory as a stateful workspace.', key: true },
          { id: 'mp-maintain-2', label: '/writing-great-skills', description: 'Reference for writing and editing skills well — the vocabulary and principles that make a skill predictable.' },
          { id: 'mp-maintain-3', label: '/migrate-to-shoehorn', description: 'Migrate test files from as type assertions to @total-typescript/shoehorn.' },
          { id: 'mp-maintain-4', label: '/git-guardrails-claude-code', description: 'Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean) before they execute.' },
        ],
      },
    ],
  },
  {
    id: 'gsd',
    label: 'GTD — Getting Things Done',
    description: 'David Allen\'s stress-free productivity method, first published in 2001 and revised in 2015. The premise: there is an inverse relationship between what\'s on your mind and what gets done. GTD moves every task, idea, and commitment out of your head and into a trusted external system, so your attention can focus on taking action. The canonical five stages — capture, clarify, organize, reflect, engage — are extended here with explicit Execute and Ship loops so the method closes the loop instead of just collecting. Best for knowledge workers juggling many open loops, contexts, and projects with no clear edges.',
    principles: ['Trusted system', 'Mind like water', 'Two-minute rule', 'Context lists', 'Horizons of focus', 'Weekly review'],
    author: {
      name: 'David Allen',
      bio: 'Author of Getting Things Done: The Art of Stress-Free Productivity (2001). GTD rests on moving tasks out of mind and into a trusted external system, so attention can focus on taking action.',
      links: [
        { label: 'Official site', url: 'https://gettingthingsdone.com' },
        { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Getting_Things_Done' },
      ],
    },
    sourceUrl: 'https://en.wikipedia.org/wiki/Getting_Things_Done',
    phases: [
      {
        id: 'gsd-capture',
        label: 'Capture',
        color: '#d97757',
        skills: [
          { id: 'gsd-capture-1', label: '/trusted-inbox', description: 'Collect everything into a single trusted inbox. No filtering during capture — "mind like water".', key: true },
          { id: 'gsd-capture-2', label: '/two-minute-rule', description: 'If an action takes less than two minutes, do it now rather than deferring it.' },
          { id: 'gsd-capture-3', label: '/open-loops', description: 'Surface the incompletes already on your mind. Naming them drops the cognitive load.' },
        ],
      },
      {
        id: 'gsd-clarify',
        label: 'Clarify',
        color: '#6a9bcc',
        skills: [
          { id: 'gsd-clarify-1', label: '/is-it-actionable', description: 'For each item: is it actionable? If yes, what is the next physical action?', key: true },
          { id: 'gsd-clarify-2', label: '/project-vs-task', description: 'Anything requiring more than one step is a project — it gets a desired outcome and a next action.' },
          { id: 'gsd-clarify-3', label: '/someday-maybe', description: 'Park non-active ideas and references here so they stop nagging the inbox.' },
        ],
      },
      {
        id: 'gsd-organize',
        label: 'Organize',
        color: '#b8942e',
        skills: [
          { id: 'gsd-organize-1', label: '/context-lists', description: 'Group next actions by context: @calls, @errands, @computer, @home. Right reminder, right place.', key: true },
          { id: 'gsd-organize-2', label: '/waiting-for', description: 'Track items delegated to others. A trusted follow-up list removes the anxiety of forgetting.' },
          { id: 'gsd-organize-3', label: '/reference-filing', description: 'A neat, searchable home for non-actionable reference material so the inbox stays clean.' },
        ],
      },
      {
        id: 'gsd-execute',
        label: 'Execute',
        color: '#5a8f6a',
        skills: [
          { id: 'gsd-execute-1', label: '/engage', description: 'Pick the next action by context, time available, energy available, and priority.', key: true },
          { id: 'gsd-execute-2', label: '/threefold-nature', description: 'Balance predefined work (calendar), prep work (next actions), and opportunistic work (in-the-moment).' },
          { id: 'gsd-execute-3', label: '/single-tasking', description: 'Do one thing at a time. Action without distraction is faster than action with constant switching.' },
        ],
      },
      {
        id: 'gsd-review',
        label: 'Review',
        color: '#6a9bcc',
        skills: [
          { id: 'gsd-review-1', label: '/weekly-review', description: 'Empty the inbox, update lists, review projects, look up the horizons. The keystone habit.', key: true },
          { id: 'gsd-review-2', label: '/horizons-of-focus', description: 'Six levels: current actions, current projects, areas of focus, 1–2 year goals, long-term vision, life.' },
        ],
      },
      {
        id: 'gsd-ship',
        label: 'Ship',
        color: '#d97757',
        skills: [
          { id: 'gsd-ship-1', label: '/close-the-loop', description: 'Mark completed work done. Update projects, archives, and the calendar so nothing lingers.', key: true },
          { id: 'gsd-ship-2', label: '/capture-learnings', description: 'Note what worked and what didn\'t. Feed insights back into your system and your next weekly review.' },
        ],
      },
    ],
  },
  {
    id: 'superpower',
    label: 'Superpowers',
    description: 'obra/superpowers — an agentic skills framework and software-development methodology for coding agents, built by Jesse Vincent at Prime Radiant and used across 240k+ stars worth of projects. The core idea: your coding agent does not jump straight into writing code. It starts by brainstorming a design with you, writes a plan detailed enough for a junior engineer with no judgement to follow, then dispatches a fresh subagent per task with two-stage review (spec compliance, then code quality), and finishes by verifying the branch. Skills trigger automatically — you don\'t need to remember to invoke them; the workflow is mandatory, not a suggestion. Best for greenfield work where misalignment between you and the agent is the dominant failure mode.',
    principles: ['Brainstorm first', 'Plan in 2–5 min tasks', 'Spec compliance', 'Two-stage review', 'Fresh subagents', 'Verify before done'],
    author: {
      name: 'Jesse Vincent',
      handle: '@obra',
      bio: 'Built Superpowers at Prime Radiant. An agentic skills framework & software-development methodology composed of skills that activate automatically — so your coding agent plans, tests, reviews, and ships.',
      links: [
        { label: 'GitHub', url: 'https://github.com/obra' },
        { label: 'Prime Radiant', url: 'https://primeradiant.com' },
      ],
    },
    sourceUrl: 'https://github.com/obra/superpowers',
    phases: [
      {
        id: 'sp-brainstorm',
        label: 'Brainstorm',
        color: '#b8942e',
        skills: [
          { id: 'sp-brainstorm-1', label: '/brainstorming', description: 'Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves a design doc.', key: true },
          { id: 'sp-brainstorm-2', label: '/using-git-worktrees', description: 'Creates an isolated workspace on a new branch, runs project setup, verifies clean test baseline.' },
        ],
      },
      {
        id: 'sp-plan',
        label: 'Plan',
        color: '#d97757',
        skills: [
          { id: 'sp-plan-1', label: '/writing-plans', description: 'Breaks work into bite-sized tasks (2–5 minutes each). Every task has exact file paths, complete code, verification steps.', key: true },
          { id: 'sp-plan-2', label: '/dispatching-parallel-agents', description: 'Concurrent subagent workflows for tasks that can run independently without conflict.' },
        ],
      },
      {
        id: 'sp-build',
        label: 'Build',
        color: '#5a8f6a',
        skills: [
          { id: 'sp-build-1', label: '/subagent-driven-development', description: 'Dispatches a fresh subagent per task with two-stage review: spec compliance, then code quality.', key: true },
          { id: 'sp-build-2', label: '/executing-plans', description: 'Batch execution with human checkpoints. Trade raw speed for explicit control.' },
          { id: 'sp-build-3', label: '/test-driven-development', description: 'RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit.' },
        ],
      },
      {
        id: 'sp-review',
        label: 'Review',
        color: '#6a9bcc',
        skills: [
          { id: 'sp-review-1', label: '/requesting-code-review', description: 'Reviews against the plan; reports issues by severity. Critical issues block progress.', key: true },
          { id: 'sp-review-2', label: '/receiving-code-review', description: 'Responding to feedback without arguing past your reviewer. Verify claims, push back with evidence.' },
          { id: 'sp-review-3', label: '/systematic-debugging', description: '4-phase root-cause process: reproduce, hypothesise, instrument, fix. Includes root-cause-tracing.' },
        ],
      },
      {
        id: 'sp-ship',
        label: 'Ship',
        color: '#d97757',
        skills: [
          { id: 'sp-ship-1', label: '/finishing-a-development-branch', description: 'Verifies tests, presents merge/PR/keep/discard options, cleans up the worktree.', key: true },
          { id: 'sp-ship-2', label: '/verification-before-completion', description: 'Ensure it\'s actually fixed. Reproduce again, run regression tests, prove the claim before declaring done.' },
        ],
      },
    ],
  },
];

// ─── Layout Constants ────────────────────────────────────

const PHASE_W = 200;
const PHASE_H = 48;
const SKILL_W = 200;
const SKILL_H = 56;
const PHASE_GAP_X = 80;
const SKILL_GAP_Y = 12;
const WORKFLOW_GAP_Y = 100;
const PADDING_X = 60;
const PADDING_Y = 60;
const WORKFLOW_TITLE_H = 44;

function layoutWorkflow(def: WorkflowDef, offsetX: number, offsetY: number) {
  const wid = def.id;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let cursorX = offsetX + PADDING_X;
  const titleY = offsetY + PADDING_Y;

  // Workflow title uses no node — rendered separately

  let phaseStartY = titleY + WORKFLOW_TITLE_H + 20;

  def.phases.forEach((phase, pi) => {
    const phaseX = cursorX;
    const phaseY = phaseStartY;

    // Phase header node
    const phaseNode: Node = {
      id: phase.id,
      type: 'phase',
      label: phase.label,
      description: '',
      color: phase.color,
      phaseId: phase.id,
      workflowId: wid,
      x: phaseX,
      y: phaseY,
      w: PHASE_W,
      h: PHASE_H,
    };
    nodes.push(phaseNode);

    // Skill nodes below phase header (no connecting lines)
    let skillY = phaseY + PHASE_H + 16;
    phase.skills.forEach((skill) => {
      const skillNode: Node = {
        id: skill.id,
        type: 'skill',
        label: skill.label,
        description: skill.description,
        color: phase.color,
        phaseId: phase.id,
        workflowId: wid,
        x: phaseX,
        y: skillY,
        w: SKILL_W,
        h: SKILL_H,
        key: skill.key,
      };
      nodes.push(skillNode);

      skillY += SKILL_H + SKILL_GAP_Y;
    });

    // Progressive timeline through phase header centers
    if (pi < def.phases.length - 1) {
      const nextPhase = def.phases[pi + 1];
      const nextX = cursorX + PHASE_W + PHASE_GAP_X;
      const routeY = phaseY + PHASE_H / 2;
      edges.push({
        from: phase.id,
        to: nextPhase.id,
        x1: phaseX + PHASE_W,
        y1: routeY,
        x2: nextX,
        y2: routeY,
      });
    }

    cursorX += PHASE_W + PHASE_GAP_X;
  });

  const totalW = cursorX - offsetX - PADDING_X + PHASE_GAP_X;
  const totalH = (phaseStartY - offsetY) + (def.phases.reduce((max, p) => Math.max(max, p.skills.length), 0)) * (SKILL_H + SKILL_GAP_Y) + PADDING_Y;

  return { nodes, edges, width: totalW, height: totalH };
}

function layoutAll(defs: WorkflowDef[]) {
  let allNodes: Node[] = [];
  let allEdges: Edge[] = [];
  let cursorY = 60;
  let maxW = 0;

  defs.forEach((def) => {
    const laid = layoutWorkflow(def, 60, cursorY);
    allNodes = allNodes.concat(laid.nodes);
    allEdges = allEdges.concat(laid.edges);
    maxW = Math.max(maxW, laid.width);
    cursorY += laid.height + WORKFLOW_GAP_Y;
  });

  return { nodes: allNodes, edges: allEdges, totalW: maxW + 120, totalH: cursorY };
}

// ─── SVG Edge Path ───────────────────────────────────────

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  if (x1 === x2) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const dx = Math.abs(x2 - x1);
  const cp = Math.min(dx * 0.5, 60);
  return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
}

// ─── Components ──────────────────────────────────────────

function EdgeLine({ edge }: { edge: Edge }) {
  return (
    <path
      d={edgePath(edge.x1, edge.y1, edge.x2, edge.y2)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-border-strong opacity-35"
      strokeLinecap="round"
    />
  );
}

type PlacedNodeProps = {
  node: Node;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onSelect: (node: Node) => void;
  showCopy?: boolean;
  showCore?: boolean;
};

function PlacedNode({ node, hovered, onHover, onSelect, showCopy, showCore }: PlacedNodeProps) {
  const isPhase = node.type === 'phase';
  const isHovered = hovered === node.id;
  const isKeyNode = !isPhase && node.key && showCore;
  const hoverAlpha = node.color + (isHovered ? '30' : '12');

  const copyToClipboard = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  }, []);

  const borderColor = isPhase
    ? node.color + '50'
    : isKeyNode
      ? node.color + 'cc'
      : isHovered
        ? node.color + '60'
        : 'var(--color-border)';

  const borderWidth = isKeyNode ? 2 : 1;

  return (
    <div
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        width: node.w,
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full rounded-[14px] flex flex-col items-start transition-all duration-200 ${
          isPhase
            ? 'font-[700] text-sm tracking-tight shadow-sm cursor-default justify-center text-center'
            : 'font-[500] text-xs shadow-xs cursor-pointer'
        } ${isPhase ? 'px-3.5' : 'px-3.5 py-2.5'}`}
        style={{
          minHeight: node.h,
          background: isPhase ? node.color + '15' : hoverAlpha,
          borderWidth: `${borderWidth}px`,
          borderStyle: 'solid',
          borderColor,
          color: isPhase ? node.color : 'var(--color-text)',
        }}
        whileHover={isPhase ? { boxShadow: '0 4px 15px rgba(0,0,0,0.06)' } : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
        onClick={() => !isPhase && onSelect(node)}
      >
        <span className={`${isPhase ? 'truncate w-full' : 'leading-tight w-full'}`}>
          {node.label}
        </span>

        {!isPhase && (
          <AnimatePresence initial={false}>
            {isHovered && node.description && (
              <motion.span
                key="desc"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="text-[10px] font-normal text-muted leading-snug break-words w-full overflow-hidden block"
              >
                {node.description}
              </motion.span>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {showCopy && !isPhase && (
        <button
          type="button"
          onClick={(e) => copyToClipboard(e, node.label)}
          className="absolute -top-1.5 -right-1.5 z-30 flex items-center justify-center w-5 h-5 rounded-full border border-border bg-surface text-muted hover:text-text hover:bg-surface-hover shadow-sm cursor-pointer"
          title="Copy command"
        >
          <Copy size={10} />
        </button>
      )}
    </div>
  );
}

// ─── Main View ───────────────────────────────────────────

type Viewport = { x: number; y: number; scale: number };

const clampScale = (s: number) => Math.max(0.2, Math.min(3, s));

type WorkflowsViewProps = {
  onAddToLibrary?: (workflowId: string, phaseId: string, label: string, description: string) => void;
};

export function WorkflowsView({ onAddToLibrary }: WorkflowsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState<Viewport>({ x: 0, y: 0, scale: 0.65 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [vpStart, setVpStart] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCore, setShowCore] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  const layout = useMemo(() => layoutAll(WORKFLOW_DATA), []);

  const filteredDefs = activeWorkflow === 'all'
    ? WORKFLOW_DATA
    : WORKFLOW_DATA.filter((w) => w.id === activeWorkflow);

  const activeDef = useMemo(() => {
    if (activeWorkflow === 'all') {
      return {
        kind: 'aggregate' as const,
        id: 'all',
        label: 'All Workflows',
        description:
          'Three end-to-end workflows for engineering, productivity, and human-AI collaboration. Pick one above to focus the canvas.',
      };
    }
    const def = WORKFLOW_DATA.find((w) => w.id === activeWorkflow);
    if (!def) return null;
    return { kind: 'workflow' as const, def };
  }, [activeWorkflow]);

  const activeStats = useMemo(() => {
    if (!activeDef) return null;
    if (activeDef.kind === 'aggregate') {
      const phases = WORKFLOW_DATA.reduce((s, w) => s + w.phases.length, 0);
      const totalSkills = WORKFLOW_DATA.reduce(
        (s, w) => s + w.phases.reduce((ss, p) => ss + p.skills.length, 0),
        0,
      );
      const core = WORKFLOW_DATA.reduce(
        (s, w) => s + w.phases.reduce((ss, p) => ss + p.skills.filter((sk) => sk.key).length, 0),
        0,
      );
      return { workflows: WORKFLOW_DATA.length, phases, totalSkills, core };
    }
    const def = activeDef.def;
    const totalSkills = def.phases.reduce((s, p) => s + p.skills.length, 0);
    const core = def.phases.reduce(
      (s, p) => s + p.skills.filter((sk) => sk.key).length,
      0,
    );
    return { workflows: 1, phases: def.phases.length, totalSkills, core };
  }, [activeDef]);

  const activeAuthor = useMemo(() => {
    if (activeDef?.kind === 'workflow') return activeDef.def.author;
    return null;
  }, [activeDef]);

  const activeRepoUrl = useMemo(() => {
    if (activeDef?.kind === 'workflow') return activeDef.def.sourceUrl;
    return null;
  }, [activeDef]);

  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>();
    filteredDefs.forEach((def) =>
      def.phases.forEach((phase) => {
        ids.add(phase.id);
        phase.skills.forEach((skill) => ids.add(skill.id));
      })
    );
    return ids;
  }, [filteredDefs]);

  const visibleNodes = useMemo(
    () => layout.nodes.filter((n) => visibleNodeIds.has(n.id)),
    [layout.nodes, visibleNodeIds],
  );

  // ── Auto-frame on workflow switch ──

  useEffect(() => {
    if (visibleNodes.length === 0) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    visibleNodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.w > maxX) maxX = n.x + n.w;
      if (n.y + n.h > maxY) maxY = n.y + n.h;
    });

    const pad = 80;
    const contentW = maxX - minX + pad * 2;
    const contentH = maxY - minY + pad * 2;
    const scale = clampScale(Math.min(rect.width / contentW, rect.height / contentH));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const x = -cx + rect.width / 2 / scale;
    const y = -cy + rect.height / 2 / scale;

    setVp({ x, y, scale });
  }, [filteredDefs, visibleNodes]);

  // ── Pan ──

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setVpStart({ x: vp.x, y: vp.y });
  }, [vp]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panning) return;
    setVp((prev) => ({
      ...prev,
      x: vpStart.x + (e.clientX - panStart.x) / prev.scale,
      y: vpStart.y + (e.clientY - panStart.y) / prev.scale,
    }));
  }, [panning, panStart, vpStart]);

  const handleMouseUp = useCallback(() => setPanning(false), []);

  // ── Zoom ──

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    const delta = -e.deltaY * 0.001;
    setVp((prev) => {
      const ns = clampScale(prev.scale * (1 + delta));
      const ratio = ns / prev.scale;
      return {
        scale: ns,
        x: prev.x - (mx - 0.5) * (rect.width / prev.scale) * (ratio - 1) * prev.scale / ns,
        y: prev.y - (my - 0.5) * (rect.height / prev.scale) * (ratio - 1) * prev.scale / ns,
      };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <section className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent">Canvas</p>
        <div className="flex items-center gap-1 px-2 py-1 rounded-[10px] border border-border bg-surface">
          {[
            { id: 'all', label: 'All' },
            { id: 'matt-pocock', label: 'Matt Pocock' },
            { id: 'gsd', label: 'GSD' },
            { id: 'superpower', label: 'Superpower' },
          ].map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveWorkflow(w.id)}
              className={`px-2.5 py-1 rounded-[8px] text-xs font-[650] transition-colors cursor-pointer border-0 ${
                activeWorkflow === w.id
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-text hover:bg-surface-subtle'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[10px] border border-border bg-surface">
          <button
            type="button"
            onClick={() => setShowCore((p) => !p)}
            className={`px-2 py-1 rounded-[8px] text-xs font-[650] transition-colors cursor-pointer border-0 ${
              showCore
                ? 'bg-accent text-white'
                : 'text-muted hover:text-text hover:bg-surface-subtle'
            }`}
          >
            Core
          </button>
          <button
            type="button"
            onClick={() => setShowCopy((p) => !p)}
            className={`flex items-center gap-1 px-2 py-1 rounded-[8px] text-xs font-[650] transition-colors cursor-pointer border-0 ${
              showCopy
                ? 'bg-accent text-white'
                : 'text-muted hover:text-text hover:bg-surface-subtle'
            }`}
          >
            <Copy size={12} />
            Copy
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted font-mono tabular-nums">
            {Math.round(vp.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setVp((p) => ({ ...p, scale: clampScale(p.scale * 1.2) }))}
            className="flex items-center justify-center w-7 h-7 rounded-[8px] border border-border text-muted hover:text-text hover:bg-surface-subtle text-sm font-[700] cursor-pointer"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setVp((p) => ({ ...p, scale: clampScale(p.scale / 1.2) }))}
            className="flex items-center justify-center w-7 h-7 rounded-[8px] border border-border text-muted hover:text-text hover:bg-surface-subtle text-sm font-[700] cursor-pointer"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflow('all')}
            className="flex items-center justify-center w-7 h-7 rounded-[8px] border border-border text-muted hover:text-text hover:bg-surface-subtle text-xs cursor-pointer"
            title="Fit all"
          >
            ⊞
          </button>
        </div>
      </div>

      {/* Workflow intro */}
      <AnimatePresence mode="wait" initial={false}>
        {activeDef && activeStats && (
          <motion.section
            key={activeDef.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 shrink-0 p-5 rounded-[18px] border border-border bg-surface"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent">
                  {activeDef.kind === 'aggregate' ? 'Overview' : 'Workflow'}
                </p>
                <h2 className="m-0 mt-1 text-[22px] font-[700] tracking-tight text-text leading-tight">
                  {activeDef.label}
                </h2>
                <p className="m-0 mt-2 text-[13px] text-muted leading-relaxed">
                  {activeDef.description}
                </p>
                {activeDef.kind === 'workflow' && activeDef.def.principles.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {activeDef.def.principles.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-full text-[10px] font-[650] text-muted bg-surface-subtle border border-border"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-4 text-[11px] font-[650] text-faint flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {activeStats.workflows} {activeStats.workflows === 1 ? 'workflow' : 'workflows'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {activeStats.phases} phases
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    {activeStats.totalSkills} skills
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {activeStats.core} core
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowAuthorModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border border-border bg-surface-subtle text-xs font-[650] text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <UserCircle size={12} weight="duotone" />
                    About author
                  </button>
                  {activeRepoUrl && (
                    <a
                      href={activeRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border border-border bg-surface-subtle text-xs font-[650] text-muted hover:text-text hover:bg-surface-hover transition-colors"
                    >
                      <GithubLogo size={12} weight="duotone" />
                      Repo
                      <ArrowSquareOut size={10} className="opacity-60" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-[460px] justify-end">
                {activeDef.kind === 'aggregate' ? (
                  WORKFLOW_DATA.map((w, idx) => (
                    <span
                      key={w.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[650] border"
                      style={{
                        background: (w.phases[0]?.color ?? '#d97757') + '12',
                        color: w.phases[0]?.color ?? '#d97757',
                        borderColor: (w.phases[0]?.color ?? '#d97757') + '40',
                      }}
                    >
                      <span className="opacity-50 mr-1.5 font-mono tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {w.label}
                    </span>
                  ))
                ) : (
                  activeDef.def.phases.map((phase, idx) => (
                    <span
                      key={phase.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[650] border"
                      style={{
                        background: phase.color + '12',
                        color: phase.color,
                        borderColor: phase.color + '40',
                      }}
                    >
                      <span className="opacity-50 mr-1.5 font-mono tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {phase.label}
                    </span>
                  ))
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-[22px] border border-border bg-bg select-none"
        style={{ cursor: panning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.4 }}
        >
          <defs>
            <pattern id="grid" width={30 * vp.scale} height={30 * vp.scale} patternUnits="userSpaceOnUse"
              patternTransform={`translate(${(vp.x * vp.scale) % (30 * vp.scale)} ${(vp.y * vp.scale) % (30 * vp.scale)})`}
            >
              <circle cx="0" cy="0" r="1" fill="currentColor" className="text-border" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Transformed content */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${vp.x * vp.scale}px, ${vp.y * vp.scale}px) scale(${vp.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: layout.totalW, minHeight: layout.totalH }}>
            {layout.edges
              .filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
              .map((edge) => (
                <EdgeLine key={`${edge.from}-${edge.to}`} edge={edge} />
              ))}
          </svg>

          {/* Workflow section labels (description lives in the intro above the canvas) */}
          {filteredDefs.map((def) => {
            const defIndex = WORKFLOW_DATA.findIndex((w) => w.id === def.id);
            let yOff = 60;
            for (let i = 0; i < defIndex; i++) {
              const prev = layoutWorkflow(WORKFLOW_DATA[i], 60, yOff);
              yOff += prev.height + WORKFLOW_GAP_Y;
            }
            const titleX = 60 + PADDING_X;
            const titleY = yOff + PADDING_Y;

            return (
              <div
                key={def.id}
                className="absolute pointer-events-none"
                style={{ left: titleX, top: titleY - 4 }}
              >
                <p className="m-0 text-sm font-[750] tracking-[0.06em] uppercase text-muted/60">{def.label}</p>
              </div>
            );
          })}

          {/* Nodes */}
          {layout.nodes
            .filter((n) => filteredDefs.some((d) => d.phases.some((p) => p.id === n.phaseId)))
              .map((node) => (
              <div key={node.id} data-node>
                <PlacedNode
                  node={node}
                  hovered={hovered}
                  onHover={setHovered}
                  onSelect={setSelectedNode}
                  showCopy={showCopy}
                  showCore={showCore}
                />
              </div>
            ))}
        </div>

        {/* Empty state hint */}
        {filteredDefs.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            Select a workflow above
          </div>
        )}
      </div>

      {/* Node detail modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/44 p-7"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedNode(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-[480px] rounded-[22px] border border-border bg-surface p-6 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase" style={{ color: selectedNode.color }}>
                    {WORKFLOW_DATA.find((w) => w.id === selectedNode.workflowId)?.label ?? selectedNode.workflowId}
                    {' / '}
                    {WORKFLOW_DATA.flatMap((w) => w.phases).find((p) => p.id === selectedNode.phaseId)?.label ?? selectedNode.phaseId}
                  </p>
                  <h2 className="m-0 mt-1 text-xl font-[700] tracking-tight text-text">{selectedNode.label}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="border-0 bg-transparent text-muted hover:text-text cursor-pointer p-1 transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedNode.description && (
                <p className="m-0 text-sm text-muted leading-relaxed mb-6">{selectedNode.description}</p>
              )}

              {onAddToLibrary && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToLibrary(selectedNode.workflowId, selectedNode.phaseId, selectedNode.label, selectedNode.description);
                    setSelectedNode(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-accent text-white text-sm font-[650] hover:bg-accent-strong transition-colors cursor-pointer border-0"
                >
                  <BookOpen size={16} />
                  Open in Library
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Author modal */}
      <AnimatePresence>
        {showAuthorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/44 p-7"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAuthorModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-[480px] rounded-[22px] border border-border bg-surface p-6 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <p className="m-0 text-xs font-[750] tracking-[0.1em] uppercase text-accent">
                    {activeAuthor ? 'About' : 'Workflows'}
                  </p>
                  <h2 className="m-0 mt-1 text-xl font-[700] tracking-tight text-text">
                    {activeAuthor ? activeAuthor.name : 'Three methodologies'}
                  </h2>
                  {activeAuthor?.handle && (
                    <p className="m-0 mt-0.5 text-xs text-muted font-mono">{activeAuthor.handle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthorModal(false)}
                  className="border-0 bg-transparent text-muted hover:text-text cursor-pointer p-1 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {activeAuthor ? (
                <>
                  <p className="m-0 text-sm text-muted leading-relaxed">{activeAuthor.bio}</p>
                  <div className="mt-5 pt-5 border-t border-border flex items-center gap-2 flex-wrap">
                    {activeAuthor.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-border bg-surface-subtle text-xs font-[650] text-muted hover:text-text hover:bg-surface-hover transition-colors"
                      >
                        {link.label}
                        <ArrowSquareOut size={10} className="opacity-60" />
                      </a>
                    ))}
                    {activeRepoUrl && (
                      <a
                        href={activeRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-border bg-surface-subtle text-xs font-[650] text-muted hover:text-text hover:bg-surface-hover transition-colors"
                      >
                        <GithubLogo size={12} weight="duotone" />
                        Source
                        <ArrowSquareOut size={10} className="opacity-60" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="m-0 text-sm text-muted leading-relaxed">
                    Three end-to-end methodologies from independent authors. Pick one above to focus the canvas and see attribution.
                  </p>
                  <div className="mt-5 pt-5 border-t border-border flex flex-col gap-2">
                    {WORKFLOW_DATA.map((w) => (
                      <a
                        key={w.id}
                        href={w.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[12px] border border-border bg-surface-subtle hover:bg-surface-hover transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="m-0 text-sm font-[650] text-text">{w.author.name}</p>
                          <p className="m-0 text-xs text-muted">{w.label}</p>
                        </div>
                        <ArrowSquareOut size={14} className="text-muted group-hover:text-text shrink-0" />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
