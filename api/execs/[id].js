import { redis } from "../../lib/redis.js";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "invalid_argument", message: "id required" });
  if (!redis) {
    return res.status(500).json({ error: "db_not_configured", message: "Redis(Upstash) 환경변수가 설정되지 않았습니다. Vercel Storage에서 Upstash for Redis를 연결하고 재배포해 주세요." });
  }

  try {
    if (req.method === "GET") {
      const record = await redis.get(`exec:${id}`);
      if (!record) return res.status(404).json({ error: "not_found" });
      return res.status(200).json({ id, record });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      await redis.set(`exec:${id}`, body);
      await redis.sadd("exec:ids", id);
      return res.status(200).json({ id, record: body });
    }

    if (req.method === "DELETE") {
      await redis.del(`exec:${id}`);
      await redis.srem("exec:ids", id);
      return res.status(200).json({ id, deleted: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error", message: String((e && e.message) || e) });
  }
}
