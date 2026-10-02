import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const config = await kv.get("app:config");
      return res.status(200).json({ config: config || null });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      await kv.set("app:config", body);
      return res.status(200).json({ config: body });
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error", message: String(e && e.message || e) });
  }
}
