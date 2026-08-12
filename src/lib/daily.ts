export async function createDailyRoom(name: string): Promise<{ url: string }> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error("DAILY_API_KEY environment variable is not set");
  }

  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, privacy: "public" }),
  });
  if (!res.ok) {
    throw new Error(`Daily room creation failed: ${res.status}`);
  }
  return res.json();
}
