export type ListItem = { id: number; title: string };

export type PaginationPage = {
  pageNumber: number;
  items: ListItem[];
  query: string;
  hadInsertBeforeThisPage: boolean;
};

export type PaginationAnomaly = {
  kind: "duplicate" | "skip" | "none";
  detail: string;
};

export type PaginationLane = {
  pages: PaginationPage[];
  anomaly: PaginationAnomaly;
};

export type PaginationLanes = {
  offset: PaginationLane;
  cursor: PaginationLane;
};

const PAGE_SIZE = 3;

// Newest-first feed, as most real "recent items" APIs are ordered — ids
// descending by recency, matching how a real insert lands at the front.
function buildInitialFeed(): ListItem[] {
  const items: ListItem[] = [];
  for (let id = 10; id >= 1; id--) {
    items.push({ id, title: `Item #${id}` });
  }
  return items; // ids 10..1, newest first
}

function runOffsetPagination(): PaginationLane {
  let feed = buildInitialFeed();
  const pages: PaginationPage[] = [];

  const page1Items = feed.slice(0, PAGE_SIZE);
  pages.push({
    pageNumber: 1,
    items: page1Items,
    query: `SELECT * FROM items ORDER BY id DESC LIMIT ${PAGE_SIZE} OFFSET 0`,
    hadInsertBeforeThisPage: false,
  });

  // A real insert lands at the front of the feed between page 1 and page 2 —
  // exactly the scenario that breaks OFFSET-based paging.
  feed = [{ id: 11, title: "Item #11 (new)" }, ...feed];

  const page2Items = feed.slice(PAGE_SIZE, PAGE_SIZE * 2);
  pages.push({
    pageNumber: 2,
    items: page2Items,
    query: `SELECT * FROM items ORDER BY id DESC LIMIT ${PAGE_SIZE} OFFSET ${PAGE_SIZE}`,
    hadInsertBeforeThisPage: true,
  });

  const page1Ids = new Set(page1Items.map((i) => i.id));
  const duplicate = page2Items.find((i) => page1Ids.has(i.id));

  const anomaly: PaginationAnomaly = duplicate
    ? {
        kind: "duplicate",
        detail: `id ${duplicate.id} appeared on both page 1 and page 2 — the new insert shifted every row down by one offset slot.`,
      }
    : { kind: "none", detail: "no anomaly" };

  return { pages, anomaly };
}

function runCursorPagination(): PaginationLane {
  let feed = buildInitialFeed();
  const pages: PaginationPage[] = [];

  const page1Items = feed.slice(0, PAGE_SIZE);
  pages.push({
    pageNumber: 1,
    items: page1Items,
    query: `SELECT * FROM items ORDER BY id DESC LIMIT ${PAGE_SIZE}`,
    hadInsertBeforeThisPage: false,
  });

  const lastSeenId = page1Items[page1Items.length - 1].id;

  feed = [{ id: 11, title: "Item #11 (new)" }, ...feed];

  const page2Items = feed.filter((i) => i.id < lastSeenId).slice(0, PAGE_SIZE);
  pages.push({
    pageNumber: 2,
    items: page2Items,
    query: `SELECT * FROM items WHERE id < ${lastSeenId} ORDER BY id DESC LIMIT ${PAGE_SIZE}`,
    hadInsertBeforeThisPage: true,
  });

  const page1Ids = new Set(page1Items.map((i) => i.id));
  const duplicate = page2Items.find((i) => page1Ids.has(i.id));

  const anomaly: PaginationAnomaly = duplicate
    ? {
        kind: "duplicate",
        detail: `id ${duplicate.id} appeared on both pages`,
      }
    : {
        kind: "none",
        detail: `no duplicate or skip — the cursor (id < ${lastSeenId}) is anchored to real data, not a position, so the new insert at the front doesn't shift it.`,
      };

  return { pages, anomaly };
}

export function generatePaginationLanes(): PaginationLanes {
  return {
    offset: runOffsetPagination(),
    cursor: runCursorPagination(),
  };
}
