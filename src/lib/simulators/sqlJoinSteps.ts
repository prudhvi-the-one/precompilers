export type Customer = { id: number; name: string };
export type Order = { id: number; customerId: number; item: string };

export type JoinedRow = {
  customer: Customer | null;
  order: Order | null;
};

export type JoinStep = {
  comparingCustomer: Customer | null;
  comparingOrder: Order | null;
  isMatch: boolean;
  inner: JoinedRow[];
  left: JoinedRow[];
  right: JoinedRow[];
  full: JoinedRow[];
  narration: string;
  done: boolean;
};

// Deliberately not a clean 1:1 dataset — Carol has no orders, and order 104
// references a customer that doesn't exist. INNER/LEFT/RIGHT/FULL genuinely
// diverge on this data; the divergence isn't cosmetic.
export const CUSTOMERS: Customer[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
];

export const ORDERS: Order[] = [
  { id: 101, customerId: 1, item: "Book" },
  { id: 102, customerId: 1, item: "Pen" },
  { id: 103, customerId: 2, item: "Mouse" },
  { id: 104, customerId: 4, item: "Laptop" },
];

// A real nested-loop join over every customer/order pair — one step per pair
// examined — incrementally building all four join results from the same
// real comparisons, then a final null-padding pass for unmatched rows.
export function generateJoinSteps(customers: Customer[], orders: Order[]): JoinStep[] {
  const steps: JoinStep[] = [];
  const inner: JoinedRow[] = [];
  const left: JoinedRow[] = [];
  const right: JoinedRow[] = [];
  const matchedCustomerIds = new Set<number>();
  const matchedOrderIds = new Set<number>();

  for (const customer of customers) {
    for (const order of orders) {
      const isMatch = customer.id === order.customerId;
      if (isMatch) {
        inner.push({ customer, order });
        left.push({ customer, order });
        right.push({ customer, order });
        matchedCustomerIds.add(customer.id);
        matchedOrderIds.add(order.id);
      }
      steps.push({
        comparingCustomer: customer,
        comparingOrder: order,
        isMatch,
        inner: [...inner],
        left: [...left],
        right: [...right],
        full: [...left, ...right.filter((r) => !left.includes(r))],
        narration: isMatch
          ? `${customer.name} matches order #${order.id} (${order.item}) — added to INNER, LEFT, and RIGHT.`
          : `${customer.name} vs order #${order.id}: customer ids don't match — no join here.`,
        done: false,
      });
    }
  }

  for (const customer of customers) {
    if (!matchedCustomerIds.has(customer.id)) {
      left.push({ customer, order: null });
      steps.push({
        comparingCustomer: customer,
        comparingOrder: null,
        isMatch: false,
        inner: [...inner],
        left: [...left],
        right: [...right],
        full: [...left, ...right.filter((r) => r.order && !matchedCustomerIds.has(r.customer!.id))],
        narration: `${customer.name} never matched any order — LEFT keeps them with a null order.`,
        done: false,
      });
    }
  }

  for (const order of orders) {
    if (!matchedOrderIds.has(order.id)) {
      right.push({ customer: null, order });
      steps.push({
        comparingCustomer: null,
        comparingOrder: order,
        isMatch: false,
        inner: [...inner],
        left: [...left],
        right: [...right],
        full: [...left, { customer: null, order }],
        narration: `Order #${order.id} (${order.item}) has no matching customer — RIGHT keeps it with a null customer.`,
        done: false,
      });
    }
  }

  const full = [...left, ...right.filter((r) => r.customer === null)];
  steps.push({
    comparingCustomer: null,
    comparingOrder: null,
    isMatch: false,
    inner: [...inner],
    left: [...left],
    right: [...right],
    full,
    narration: `Done. INNER: ${inner.length} rows · LEFT: ${left.length} · RIGHT: ${right.length} · FULL: ${full.length}.`,
    done: true,
  });

  return steps;
}
