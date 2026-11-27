const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|adsbot|bingpreview|bytespider|petalbot|yandex|baidu|duckduck|applebot|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|semrush|ahrefs|mj12bot|dotbot|screaming frog|headlesschrome|headless|phantomjs|puppeteer|playwright|selenium|webdriver|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|datadog|newrelic|vercel|curl|wget|python-requests|python-urllib|aiohttp|httpx|axios|node-fetch|undici|go-http-client|java\/|okhttp|httpclient|postman|insomnia|scrapy|httrack|nutch|archive\.org|gptbot|oai-searchbot|chatgpt-user|claudebot|anthropic|perplexitybot|ccbot|amazonbot|meta-externalagent|google-extended|googleother|diffbot|barkrowler|sogou|360spider|qwantify|electron|cfnetwork|libwww|lwp-|guzzle|chrome-lighthouse|checker|validator|probe|scanner|scraper/i;

export function isLikelyBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = String(userAgent || "").trim();
  if (!ua || ua.length < 20) return true;
  if (BOT_UA_PATTERN.test(ua)) return true;
  // Real interactive desktop/mobile browsers always advertise Mozilla/5.0
  if (!/^Mozilla\/5\.0/i.test(ua)) return true;
  return false;
}

export function hasSuspiciousBotHeaders(headers: Headers): boolean {
  // Real interactive browsers always send Accept-Language
  const acceptLang = (headers.get("accept-language") || "").trim();
  if (!acceptLang) return true;

  // Reject browser link-preview / prefetch requests (Safari, iMessage, Slack, etc.)
  const purpose = (
    headers.get("purpose") ||
    headers.get("sec-purpose") ||
    headers.get("x-purpose") ||
    headers.get("x-moz") ||
    ""
  ).toLowerCase();
  if (/prefetch|preview|prerender/.test(purpose)) return true;

  // Reject cross-origin forged beacons to /api/analytics/visit
  const secFetchSite = (headers.get("sec-fetch-site") || "").toLowerCase();
  if (secFetchSite && secFetchSite !== "same-origin") return true;

  return false;
}
