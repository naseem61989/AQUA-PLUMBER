export default async (request, context) => {
  const url = new URL(request.url);
  console.log("Function Triggered. URL:", request.url);

  if (url.searchParams.has("gclid")) {
    const visitorIP = context.ip || "0.0.0.0";
    const gclid = url.searchParams.get("gclid");
    
    console.log("GCLID Mil Gaya:", gclid, "IP Hai:", visitorIP);

    const safeIP = encodeURIComponent(visitorIP);
    const safeGCLID = encodeURIComponent(gclid);
    const sheetUrl = `https://script.google.com/macros/s/AKfycbyx_WINVAU8eQe-qF4-F5JQ1avUOYqp0FeKb-hN2FrAFpxtZHusdkfc-jU8YhQ76upL/exec?ip=${safeIP}&gclid=${safeGCLID}`;
    
    try {
      console.log("Google ko data bhej rahe hain...");
      const response = await fetch(sheetUrl);
      console.log("Google ka Jawab (Status):", response.status);
    } catch (error) {
      console.log("Netlify Fetch Error:", error);
    }
  } else {
    console.log("Is URL mein GCLID nahi tha.");
  }

  return context.next();
};
