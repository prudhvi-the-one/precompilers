import { prisma } from "@/lib/prisma";
import { executeCode } from "@/lib/jdoodle";
import type { Problem, SubmissionVerdict, TestCase } from "@prisma/client";

export type CaseResult = {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isSample: boolean;
};

async function runTestCases(
  languageKey: string,
  sourceCode: string,
  testCases: TestCase[]
): Promise<{ results: CaseResult[]; compileError: boolean; runtimeError: boolean }> {
  const results: CaseResult[] = [];
  let compileError = false;
  let runtimeError = false;

  for (const testCase of testCases) {
    const result = await executeCode(languageKey, sourceCode, testCase.input);
    if (result.isCompiled === false) {
      compileError = true;
    } else if (result.isExecutionSuccess === false) {
      runtimeError = true;
    }
    const actualOutput = (result.output ?? "").trim();
    results.push({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      passed: actualOutput === testCase.expectedOutput.trim(),
      isSample: testCase.isSample,
    });
  }

  return { results, compileError, runtimeError };
}

export async function runSample(
  problem: Problem & { testCases: TestCase[] },
  languageKey: string,
  sourceCode: string
): Promise<{ results: CaseResult[] }> {
  const sampleCases = problem.testCases.filter((tc) => tc.isSample);
  const { results } = await runTestCases(languageKey, sourceCode, sampleCases);
  return { results };
}

function deriveVerdict(
  results: CaseResult[],
  compileError: boolean,
  runtimeError: boolean
): SubmissionVerdict {
  if (compileError) return "COMPILE_ERROR";
  if (runtimeError) return "RUNTIME_ERROR";
  return results.every((r) => r.passed) ? "ACCEPTED" : "WRONG_ANSWER";
}

export async function submitSolution(
  problemId: string,
  userId: string,
  languageKey: string,
  sourceCode: string
) {
  const problem = await prisma.problem.findUniqueOrThrow({
    where: { id: problemId },
    include: { testCases: true },
  });

  const { results, compileError, runtimeError } = await runTestCases(
    languageKey,
    sourceCode,
    problem.testCases
  );
  const verdict = deriveVerdict(results, compileError, runtimeError);
  const passedCount = results.filter((r) => r.passed).length;

  const submission = await prisma.submission.create({
    data: {
      problemId,
      userId,
      language: languageKey,
      sourceCode,
      verdict,
      passedCount,
      totalCount: results.length,
    },
  });

  return { submission, results };
}
