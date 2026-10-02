import { kv } from "@vercel/kv";

function genId() {
  return "exec_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const ids = (await kv.smembers("exec:ids")) || [];
      if (ids.length === 0) return res.status(200).json({ records: {} });
      const keys = ids.map((id) => `exec:${id}`);
      const values = await kv.mget(...keys);
      const records = {};
      ids.forEach((id, i) => {
        if (values[i]) records[id] = values[i];
      });
      return res.status(200).json({ records });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const id = genId();
      const record = { ...body, createdAt: Date.now() };
      await kv.set(`exec:${id}`, record);
      await kv.sadd("exec:ids", id);
      return res.status(200).json({ id, record });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error", message: String(e && e.message || e) });
  }
}
