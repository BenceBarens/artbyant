const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const targetSlug = params.get('slug');

    if (!targetSlug) {
    document.getElementById('article-content').innerHTML = '<p>No article found.</p>';
    return;
    }

    try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // 2. Zoek het artikel dat matcht met de slug
    const post = data.items.find(item => item.link.includes(targetSlug));

    if (!post) {
        document.getElementById('article-content').innerHTML = '<p>Artikel niet gevonden.</p>';
        return;
    }

    document.title = `${post.title} | BLOG BY ANTONI"`;
    document.getElementById('article-content').innerHTML = `
        <a href="../">Back</a>
        <h1>${post.title}</h1>
        <p><small>${new Date(post.pubDate).toLocaleDateString('en-US')}</small></p>
        <div class="body">${post.content || post.description}</div>
        <br><br>
        <a href="../" class="button">Back to blog</a> <a href="https://antonivdgeijn.substack.com/p/${targetSlug}" target="_blank" rel="noopener" class="button">Open on Substack</a>
    `;
    } catch (err) {
    document.getElementById('article-content').innerHTML = '<p>Error loading article.</p>';
    }
}

loadPost();