import type { ComponentType } from "react";
import {
  ArrayCellsIcon,
  MemoryBarsIcon,
  LightningIcon,
  ShiftIcon,
  TwoPointerIcon,
} from "@/components/learn/paths/icons";

export type LearnConcept = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export type LearnCurriculumStep = {
  title: string;
  description: string;
};

export type LearnContent = {
  headerIcon: ComponentType<{ className?: string }>;
  analogy: string;
  analogyImage?: { src: string; alt: string };
  whyItMatters: string;
  concepts: LearnConcept[];
  curriculum: LearnCurriculumStep[];
};

// Bespoke, hand-authored "Learn" content per topic — same one-topic-at-a-time
// pattern as SIMULATOR_REGISTRY (@/lib/simulators/registry), keyed by the
// topic's stable slug. A topic with no entry here just falls back to its
// plain `description` field, so this never blocks a new topic from working.
export const LEARN_CONTENT_REGISTRY: Record<string, LearnContent> = {
  arrays: {
    headerIcon: ArrayCellsIcon,
    analogy:
      "Think of an apartment building with sequentially numbered mailboxes — Box #0, #1, #2… You never search door-to-door; you walk straight to Box #4 because you already know its exact position.",
    analogyImage: {
      src: "/learn/paths/arrays-mailboxes.png",
      alt: "Row of numbered mailboxes, box 4 highlighted in fuchsia with a pointing cursor",
    },
    whyItMatters:
      "Nearly every higher-level collection — strings, matrices, hash tables, database index pages — is built on top of a contiguous array underneath. Understanding cache locality and index arithmetic is what separates a hesitant answer from a confident one in a coding interview.",
    concepts: [
      {
        title: "Contiguous Memory",
        description:
          "Elements sit at consecutive byte addresses in RAM — exactly what lets the CPU's cache prefetcher stay one step ahead of you.",
        icon: MemoryBarsIcon,
      },
      {
        title: "O(1) Random Access",
        description: "address = base + (index × size). No searching, no scanning — straight to the byte you want.",
        icon: LightningIcon,
      },
      {
        title: "The Shift Penalty — O(n)",
        description:
          "Insert or delete anywhere but the end, and every neighbor after it has to slide over to stay contiguous.",
        icon: ShiftIcon,
      },
      {
        title: "Two-Pointer & Sliding Window Preview",
        description:
          "A first taste of scanning with two indices instead of one — the full pattern gets its own dedicated topic later on this path.",
        icon: TwoPointerIcon,
      },
    ],
    curriculum: [
      {
        title: "Memory Anatomy",
        description:
          "Contiguous RAM allocation and base-address calculation — why array access is O(1) while a linked list's isn't.",
      },
      {
        title: "Core Operations",
        description: "Read, update, push, and pop — and why only \"pop from the end\" avoids the shift penalty.",
      },
      {
        title: "Prefix Sum",
        description:
          "Precompute running totals once so any range-sum query answers in O(1) instead of re-scanning the range every time.",
      },
      {
        title: "Kadane's Algorithm",
        description:
          "Track the best running subarray sum so far — the O(n) trick behind every \"maximum subarray\" interview question.",
      },
      {
        title: "Dutch National Flag & Cyclic Sort",
        description:
          "Partition three-way in one pass, and place every value at its own index in place — two array-only patterns that beat a full sort.",
      },
    ],
  },
};
