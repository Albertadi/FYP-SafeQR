// utils/directScraper.ts
import { load } from "cheerio-without-node-native";

const LIST_URL = "https://www.csa.gov.sg/alerts-and-advisories/advisories";
const BASE_URL = "https://www.csa.gov.sg";

// A small wrapper to add “browser-like” headers
async function fetchWithBrowserHeaders(input: RequestInfo, init?: RequestInit) {
  return fetch(input, {
    ...init,
    headers: {
      // pretend to be Chrome on Windows
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/115.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;" +
        "q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      Referer: LIST_URL,
      // preserve any existing headers passed in
      ...(init?.headers ?? {}),
    },
  });
}

export interface NewsHeadline {
  title:     string;
  url:       string;
  date:      string;
}

export interface NewsArticle {
  headline: string;
  content:  string;
}

/**
 * Fetch the list of CSA advisories.
 */
export async function fetchNewsHeadlines(): Promise<NewsHeadline[]> {
  const res = await fetchWithBrowserHeaders(LIST_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch list: HTTP ${res.status}`);
  }
  const html = await res.text();
  const $    = load(html);

  return $('a[href^="/alerts-and-advisories/advisories/ad-"]')
    .toArray()
    .map((el) => {
      const $el     = $(el);
      const date    = $el.find("p.prose-label-md-regular").first().text().trim();
      const titleEl = $el.find("h3 span").first();
      const title   = titleEl.attr("title")?.trim() ?? titleEl.text().trim();
      const relHref = $el.attr("href") || "";
      const url     = relHref.startsWith("http") ? relHref : BASE_URL + relHref;

      return { title, url, date, thumbnail: "" };
    });
}

/**
 * Fetch an individual advisory’s headline + body text.
 */
export async function fetchNewsArticle(url: string): Promise<NewsArticle> {
  const res = await fetchWithBrowserHeaders(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch article: HTTP ${res.status}`);
  }
  const html = await res.text();
  const $    = load(html);

  // Grab the main <h1>
  const headline = $('main#main-content h1').first().text().trim();

  // Pull every <p> and every <li> under the article container
  const container = $('main#main-content div.overflow-x-auto').first();
  let content = "";

  container
    .children()
    .each((_, el) => {
      const tag = el.tagName?.toLowerCase();
      if (tag === "p") {
        const txt = $(el).text().trim();
        if (txt) content += txt + "\n\n";
      } else if (tag === "ul") {
        $(el)
          .find("li")
          .each((_, li) => {
            const item = $(li).text().trim();
            if (item) content += "- " + item + "\n";
          });
        content += "\n";
      }
    });

  return { headline, content: content.trim() };
}
