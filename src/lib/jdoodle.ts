const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
  PYTHON3: { language: "python3", versionIndex: "4" },
  JAVASCRIPT: { language: "nodejs", versionIndex: "4" },
  JAVA: { language: "java", versionIndex: "4" },
  CPP: { language: "cpp17", versionIndex: "4" },
  C: { language: "c", versionIndex: "5" },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP);

export type JDoodleResult = {
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
  isCompiled?: boolean;
  isExecutionSuccess?: boolean;
  error?: string;
};

export async function executeCode(
  languageKey: string,
  script: string,
  stdin: string
): Promise<JDoodleResult> {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "JDOODLE_CLIENT_ID/JDOODLE_CLIENT_SECRET environment variables are not set"
    );
  }
  const mapping = LANGUAGE_MAP[languageKey];
  if (!mapping) {
    throw new Error(`Unsupported language: ${languageKey}`);
  }

  const res = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret, script, stdin, ...mapping }),
  });
  if (!res.ok) {
    throw new Error(`JDoodle request failed: ${res.status}`);
  }
  return res.json();
}
