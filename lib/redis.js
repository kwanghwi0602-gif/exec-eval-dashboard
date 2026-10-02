import { Redis } from "@upstash/redis";

// Vercel Marketplace의 "Upstash for Redis"를 프로젝트에 Connect하면
// KV_REST_API_URL / KV_REST_API_TOKEN 환경변수가 자동으로 주입됩니다.
// (예전 UPSTASH_REDIS_REST_URL/TOKEN 이름으로 들어오는 경우도 함께 지원)
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
