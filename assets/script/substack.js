const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

async function loadSubstackFeed() {
const container = document.getElementById('feed-container');

try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error retrieving data.');

    const data = await response.json();
    if (data.status !== 'ok') throw new Error(data.message || "Couldn't proccess data.");

    container.innerHTML = data.items.map(item => {
    const postDate = new Date(item.pubDate);
    const isCurrentYear = postDate.getFullYear() === new Date().getFullYear();

    const date = postDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        ...(isCurrentYear ? {} : { year: 'numeric' })
    });

    function calculateReadingTime(htmlString) {
        if (!htmlString) return '1';

        const cleanText = htmlString.replace(/<[^>]*>?/gm, ' ').trim();

        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        const wordsPerMinute = 230;
        const minutes = Math.ceil(wordCount / wordsPerMinute);

        return minutes;
    }

    const readingTime = calculateReadingTime(item.content || item.description);

    const cleanText = item.description.replace(/<[^>]*>?/gm, '').trim();
    const excerpt = cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;

    function extractFirstImage(htmlString) {
        if (!htmlString) return null;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const img = doc.querySelector('img');
        
        return img ? img.src : null;
        }

    const imageUrl = item.thumbnail || extractFirstImage(item.content || item.description);

    const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${item.title}" loading="lazy">` 
        : '';

    const slug = new URL(item.link).pathname.split('/').filter(Boolean).pop();
    const myPostUrl = `blog/p?slug=${encodeURIComponent(slug)}`;

    return `
        <li><article class="post">
            <a href="${myPostUrl}">${imageHtml}</a>
            <div>
                <div>
                    <h2><a href="${myPostUrl}">${item.title}</a></h2>
                    <div class="meta">${readingTime} min read • Posted on <time datetime="${item.pubDate}">${date}</time></div>
                    <p>${excerpt}</p>
                </div>
                <div class="actionbar">
                    <a href="${myPostUrl}" class="button">Read full article</a>
                    <a href="${item.link}" target="_blank" rel="noopener" class="button">Open on Substack</a>
                </div>
            </div>
        </article></li>
    `;
    }).join('');

} catch (error) {
    container.innerHTML = `<p>Couldn't load articles: ${error.message}</p>`;
}
}

loadSubstackFeed();