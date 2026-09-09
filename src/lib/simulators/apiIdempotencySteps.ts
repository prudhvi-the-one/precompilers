export type Resource = { id: number; idempotencyKey: string | null };

export type IdempotencyEvent = {
  requestLabel: string;
  action: "created" | "returned-existing";
  resourceCount: number;
  detail: string;
};

export type IdempotencyLane = {
  events: IdempotencyEvent[];
  finalResourceCount: number;
};

export type IdempotencyLanes = {
  withoutKey: IdempotencyLane;
  withKey: IdempotencyLane;
};

// The scenario: a client POSTs "charge $50", the response is lost to a
// network timeout before the client sees it, so the client — genuinely
// unsure whether the server processed it — retries the identical request.
const IDEMPOTENCY_KEY = "req_7f3a-charge-50";

function runWithoutIdempotencyKey(): IdempotencyLane {
  const resources: Resource[] = [];
  const events: IdempotencyEvent[] = [];
  let nextId = 1;

  // Original request
  resources.push({ id: nextId, idempotencyKey: null });
  events.push({
    requestLabel: "Original request (POST /charges)",
    action: "created",
    resourceCount: resources.length,
    detail: `Server has no way to recognize a retry — it creates resource #${nextId}.`,
  });
  nextId += 1;

  // Client times out, never sees the response, retries the same logical request
  resources.push({ id: nextId, idempotencyKey: null });
  events.push({
    requestLabel: "Retry after timeout (POST /charges)",
    action: "created",
    resourceCount: resources.length,
    detail: `Server treats this as a brand new request — it creates a SECOND resource (#${nextId}). The customer is now charged twice.`,
  });

  return { events, finalResourceCount: resources.length };
}

function runWithIdempotencyKey(): IdempotencyLane {
  const resources: Resource[] = [];
  const processedKeys = new Map<string, number>();
  const events: IdempotencyEvent[] = [];
  let nextId = 1;

  // Original request
  const existing1 = processedKeys.get(IDEMPOTENCY_KEY);
  if (existing1 === undefined) {
    resources.push({ id: nextId, idempotencyKey: IDEMPOTENCY_KEY });
    processedKeys.set(IDEMPOTENCY_KEY, nextId);
    events.push({
      requestLabel: `Original request (POST /charges, Idempotency-Key: ${IDEMPOTENCY_KEY})`,
      action: "created",
      resourceCount: resources.length,
      detail: `Key not seen before — server creates resource #${nextId} and remembers the key.`,
    });
    nextId += 1;
  }

  // Retry with the SAME idempotency key
  const existing2 = processedKeys.get(IDEMPOTENCY_KEY);
  if (existing2 !== undefined) {
    events.push({
      requestLabel: `Retry after timeout (POST /charges, Idempotency-Key: ${IDEMPOTENCY_KEY})`,
      action: "returned-existing",
      resourceCount: resources.length,
      detail: `Server recognizes the key — it returns the ORIGINAL resource #${existing2} instead of creating a new one. The customer is charged once.`,
    });
  }

  return { events, finalResourceCount: resources.length };
}

export function generateIdempotencyLanes(): IdempotencyLanes {
  return {
    withoutKey: runWithoutIdempotencyKey(),
    withKey: runWithIdempotencyKey(),
  };
}
