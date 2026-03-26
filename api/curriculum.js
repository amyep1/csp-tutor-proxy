export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZIOII2P4k94PVMO3yQ0gGIFkr5FS8y0bUGm7j24JSctPBNKJgTFSMK0LMK8lHL1z64Q/exec";
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  // ── AI chat route (POST) ──
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Drive proxy route (GET) ──
  const { action, fileId, mimeType } = req.query;
  const params = new URLSearchParams({ action: action || "list" });
  if (fileId) params.append("fileId", fileId);
  if (mimeType) params.append("mimeType", mimeType);

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`);
    if (!response.ok) throw new Error(`Apps Script returned ${response.status}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
