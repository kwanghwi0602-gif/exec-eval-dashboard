import { redis } from "../lib/redis.js";

export default async function handler(req, res) {
  if (!redis) {
    return res.status(500).json({ error: "db_not_configured", message: "Redis(Upstash) 환경변수가 설정되지 않았습니다. Vercel Storage에서 Upstash for Redis를 연결하고 재배포해 주세요." });
  }
  try {
    if (req.method === "GET") {
      const config = await redis.get("app:config");
      return res.status(200).json({ config: config || null });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      await redis.set("app:config", body);
      return res.status(200).json({ config: body });
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error", message: String((e && e.message) || e) });
  }
}
