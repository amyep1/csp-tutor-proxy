export default async function handler(req, res) {
  // Allow requests from any origin (fixes CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const PROXY_URL = "https://script.google.com/macros/s/AKfycbzZIOII2P4k94PVMO3yQ0gGIFkr5FS8y0bUGm7j24JSctPBNKJgTFSMK0LMK8lHL1z64Q/exec";

  const { action, fileId, mimeType } = req.query;
  const params = new URLSearchParams({ action: action || "list" });
  if (fileId) params.append("fileId", fileId);
  if (mimeType) params.append("mimeType", mimeType);

  try {
    const response = await fetch(`${PROXY_URL}?${params}`);
    if (!response.ok) throw new Error(`Apps Script returned ${response.status}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
