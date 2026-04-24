import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'creator', 'description'],
  }
});

// Live Data Streams
const FEED_URLS = [
  { url: 'https://medium.com/feed/tag/artificial-intelligence', category: 'AI/ML' },
  { url: 'https://medium.com/feed/tag/machine-learning', category: 'AI/ML' },
  { url: 'https://medium.com/feed/tag/trading', category: 'Trading' },
  { url: 'https://dev.to/feed/tag/java', category: 'Onyx Longterm' },
  { url: 'https://dev.to/feed/tag/algorithms', category: 'Onyx Longterm' }
];

export async function GET() {
  try {
    const allArticles = [];

    for (const feedConfig of FEED_URLS) {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        
        const articles = feed.items.slice(0, 4).map((item: any) => {
          // Extract the best available content (Medium uses content:encoded, Dev.to uses description)
          const rawHTML = item['content:encoded'] || item.description || item.content || "";
          
          // Create a clean text summary for the feed card
          const cleanSummary = rawHTML.replace(/<[^>]+>/g, '').substring(0, 160) + "...";

          return {
            id: item.guid || item.link,
            title: item.title,
            summary: cleanSummary,
            content: rawHTML, // Full HTML for the reading view
            link: item.link,
            category: feedConfig.category,
            author: item.creator || item.author || feed.title,
            published: item.pubDate
          };
        });
        allArticles.push(...articles);
      } catch (e) {
        console.warn(`Failed to parse ${feedConfig.url}`);
      }
    }

    // Sort by newest published date
    const sorted = allArticles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    return NextResponse.json({ articles: sorted });
  } catch (error) {
    console.error("RSS Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}
