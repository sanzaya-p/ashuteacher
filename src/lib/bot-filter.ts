const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|adsbot|bingpreview|bytespider|petalbot|yandex|baidu|duckduck|applebot|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|semrush|ahrefs|mj12bot|dotbot|screaming frog|headlesschrome|headless|phantomjs|puppeteer|playwright|selenium|webdriver|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|datadog|newrelic|vercel|curl|wget|python-requests|python-urllib|axios|node-fetch|undici|go-http-client|java\/|okhttp|httpclient|postman|insomnia|scrapy|httrack|nutch|archive\.org/i;

export function isLikelyBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = String(userAgent || "").trim();
  if (!ua || ua.length < 12) return true;
  return BOT_UA_PATTERN.test(ua);
}
