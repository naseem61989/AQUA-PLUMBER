export default async (request, context) => {
    try {
        const ip = context.ip || 'unknown-ip';
        
        // Check if user came from a Google Ad
        const url = new URL(request.url);
        if (!url.searchParams.has("gclid")) {
            return context.next(); // Let organic SEO traffic pass normally
        }

        // Fetch the Upstash Redis keys securely
        const redisUrl = Netlify.env.get("UPSTASH_REDIS_REST_URL");
        const redisToken = Netlify.env.get("UPSTASH_REDIS_REST_TOKEN");

        if (!redisUrl || !redisToken) {
            console.error("Missing Upstash variables in Netlify");
            return context.next(); 
        }

        // Clean the URL just in case a trailing slash was accidentally added in Netlify settings
        const cleanRedisUrl = redisUrl.replace(/\/$/, "");

        // 1. Check if this IP is already on the blocked list
        const checkRes = await fetch(`${cleanRedisUrl}/get/${ip}`, {
            headers: { Authorization: `Bearer ${redisToken}` }
        });
        
        // If Upstash sends back an error (like 401 Unauthorized), let the user through instead of crashing
        if (!checkRes.ok) {
            console.error("Upstash responded with an error:", checkRes.status);
            return context.next();
        }

        const checkData = await checkRes.json();

        // 2. If the IP is found, block them
        if (checkData.result !== null) {
            return new Response("Access Denied. To protect our ad budget, duplicate clicks are temporarily disabled. For immediate plumbing assistance in Dubai, please call our emergency number.", { status: 403 });
        }

        // 3. IP is not blocked. Add to Redis with a 3-hour timer (10800 seconds)
        await fetch(`${cleanRedisUrl}/set/${ip}/blocked/EX/10800`, {
            headers: { Authorization: `Bearer ${redisToken}` }
        });

        // Let the user see the page this first time
        return context.next();

    } catch (error) {
        // THE SAFETY NET: If literally anything goes wrong, log it and load the website normally.
        console.error("Edge Function crashed but was caught by safety net:", error);
        return context.next();
    }
};
