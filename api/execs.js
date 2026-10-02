import { redis } from "../lib/redis.js";

function genId() {
  return "exec_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export default async function handler(req, res) {
  if (!redis) {
    return res.status(500).json({ error: "db_not_configured", message: "Redis(Upstash) 환경변수가 설정되지 않았습니다. Vercel Storage에서 Upstash for Redis를 연결하고 재배포해 주세요." });
  }
  try {
    if (req.method === "GET") {
      const ids = (await redis.smembers("exec:ids")) || [];
      if (ids.length === 0) return res.status(200).json({ records: {} });
      const keys = ids.map((id) => `exec:${id}`);
      const values = await redis.mget(...keys);
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
      await redis.set(`exec:${id}`, record);
      await redis.sadd("exec:ids", id);
      return res.status(200).json({ id, record });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error", message: String((e && e.message) || e) });
  }
}
