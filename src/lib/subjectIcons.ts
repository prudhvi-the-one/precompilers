import { Code2, Database, Brain, GitBranch, Atom, Layers, Terminal, Cloud, Component, Workflow, BookOpen, type LucideIcon } from "lucide-react";

// Subject.iconKey is a free string (matches this schema's existing free-form
// convention elsewhere) with no DB-level enum — an unrecognized key falls
// back to BookOpen rather than rendering nothing.
export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  code: Code2,
  database: Database,
  brain: Brain,
  git: GitBranch,
  atom: Atom,
  layers: Layers,
  terminal: Terminal,
  cloud: Cloud,
  component: Component,
  workflow: Workflow,
};

export function subjectIcon(iconKey: string): LucideIcon {
  return SUBJECT_ICONS[iconKey] ?? BookOpen;
}

export const SUBJECT_ICON_OPTIONS = Object.keys(SUBJECT_ICONS);
