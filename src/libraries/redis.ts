import { Redis } from "ioredis";
import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";

// Create type definitions for custom command in Redis
declare module "ioredis" {
    interface Redis {
        expiremember(key: string, member: string, seconds: number): Promise<number>;
    }
}

const redisClient = new Redis(CONFIGS.REDIS_URI, {
    lazyConnect: true,
});

// Add custom commands to Redis Fork (keyDB)
redisClient.addBuiltinCommand("expiremember"); // learn more: https://docs.keydb.dev/blog/2021/06/08/blog-post/

redisClient.on("connect", () => {
    if (DEPLOYMENT_ENV !== "production") {
        console.log(`:::> Connected to redis database. ${CONFIGS.REDIS_URI}`);
    }
});

redisClient.on("error", (error) => {
    console.error("<::: Couldn't connect to redis database", error);
});

export { redisClient };
