export default async (request, context) => {
    const ip = context.ip;
    
    // Check if user came from a Google Ad
    const url = new URL(request.url);
    if (!url.searchParams.has("gclid")) {
        return context.next(); // Let organic SEO traffic pass normally
    }

    // Fetch the Upstash Redis keys securely from Netlify
    const redisUrl = Netlify.env.get("UPSTASH_REDIS_REST_URL");
    const redisToken = Netlify.env.get("UPSTASH_REDIS_REST_TOKEN");

    if (!redisUrl || !redisToken) {
        return context.next(); // Fail gracefully if keys are missing
    }

    // Check if this IP is already on the blocked list
    const checkRes = await fetch(`${redisUrl}/get/${ip}`, {
        headers: { Authorization: `Bearer ${redisToken}` }
    });
    const checkData = await checkRes.json();

    if (checkData.result !== null) {
        // IP is in Redis, block them
        return new Response("Access Denied. To protect our ad budget, duplicate clicks are temporarily disabled. For immediate plumbing assistance in Dubai, please call our emergency number.", { status: 403 });
    }

    // IP is not blocked. Add to Redis with a 3-hour timer (10800 seconds)
    await fetch(`${redisUrl}/set/${ip}/blocked/EX/10800`, {
        headers: { Authorization: `Bearer ${redisToken}` }
    });

    // Let the user see the page this first time
    return context.next();
};
