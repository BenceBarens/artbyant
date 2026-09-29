const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

function calculateReadingTime(htmlString) {
    if (!htmlString) return '1';
    const cleanText = htmlString.replace(/<[^>]*>?/gm, ' ').trim();
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    return Math.ceil(words.length / 230);
}

function formatDate(pubDateString) {
    const postDate = new Date(pubDateString);
    const isCurrentYear = postDate.getFullYear() === new Date().getFullYear();

    return postDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        ...(isCurrentYear ? {} : { year: 'numeric' })
    });
}

function extractFirstImage(htmlString) {
    if (!htmlString) return null;
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.querySelector('img')?.src || null;
}

function setVibrantColor(imageUrl, element) {
    if (!imageUrl || typeof ColorThief === 'undefined') return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
        try {
            const colorThief = new ColorThief();
            const palette = colorThief.getPalette(img, 8);
            if (!palette?.length) return;

            let mostVibrant = palette[0];
            let maxSat = -1;

            palette.forEach(([r, g, b]) => {
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const sat = max === 0 ? 0 : (max - min) / max;

                if (max > 40 && sat > maxSat) {
                    maxSat = sat;
                    mostVibrant = [r, g, b];
                }
            });

            element.style.setProperty('--cover-color', `rgb(${mostVibrant.join(', ')})`);
        } catch {}
    };

    const sep = imageUrl.includes('?') ? '&' : '?';
    img.src = `${imageUrl}${sep}cors_bust=${Date.now()}`;
}

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

        const post = data.items.find(item => item.link.includes(targetSlug));

        if (!post) {
            document.getElementById('article-content').innerHTML = '<p>No article found.</p>';
            return;
        }

        const imageUrl = post.thumbnail || extractFirstImage(post.content || post.description);
        if (imageUrl) {
            setVibrantColor(imageUrl, document.documentElement);
        }

        const subtitle = post.description ? `<p id="subtitle">${post.description}</p>` : '';
        const date = formatDate(post.pubDate);
        const readingTime = calculateReadingTime(post.content || post.description);

        document.title = `${post.title} | BLOG BY ANTONI`;
        
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", `${post.title} | BLOG BY ANTONI`);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && post.description) ogDesc.setAttribute("content", post.description);

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && imageUrl) ogImage.setAttribute("content", imageUrl);

        document.getElementById('article-content').innerHTML = `
            <a href="../" class="button2" aria-label="Back to all posts">&larr;</a>
            <span class="meta">${readingTime} min read • Posted on <time datetime="${post.pubDate}">${date}</time></span>
            <h1>${post.title}</h1>
            ${subtitle}
            <div class="body">${post.content || post.description}</div>
            <br><br>
            <a href="../" class="button">Back to blog</a> 
            <a href="https://antonivdgeijn.substack.com/p/${targetSlug}" target="_blank" rel="noopener" class="button2">Open on Substack</a>
        `;
    } catch (err) {
        document.getElementById('article-content').innerHTML = '<p>Error loading article.</p>';
    }
}

loadPost();