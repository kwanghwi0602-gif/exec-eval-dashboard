import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "invalid_argument", message: "id required" });

  try {
    if (req.method === "GET") {
      const record = await kv.get(`exec:${id}`);
      if (!record) return res.status(404).json({ error: "not_found" });
      return res.status(200).json({ id, record });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      await kv.set(`exec:${id}`, body);
      await kv.sadd("exec:ids", id);
      return res.status(200).json({ id, record: body });
    }

    if (req.method === "DELETE") {
      await kv.del(`exec:${id}`);
      await kv.srem("exec:ids", id);
      return res.status(200).json({ id, deleted: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error", message: String(e && e.message || e) });
  }
}
