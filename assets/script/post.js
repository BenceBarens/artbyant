const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;
const colorThief = new ColorThief();

function calculateReadingTime(htmlString) {
    if (!htmlString) return '1';
    const cleanText = htmlString.replace(/<[^>]*>?/gm, ' ').trim();
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const minutes = Math.ceil(words.length / 230);
    return minutes;
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

async function applyCoverColor(post) {
    let imgUrl = post?.thumbnail;
    if (!imgUrl && (post?.content || post?.description)) {
        const doc = new DOMParser().parseFromString(post.content || post.description, 'text/html');
        imgUrl = doc.querySelector('img')?.src || null;
    }

    if (!imgUrl) return;

    const accentColor = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
        try {
            const palette = colorThief.getPalette(img, 8);
            let mostVibrant = palette[0];
            let maxSaturation = -1;

            palette.forEach(([r, g, b]) => {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;

            if (max > 40 && saturation > maxSaturation) {
                maxSaturation = saturation;
                mostVibrant = [r, g, b];
            }
            });

            const [r, g, b] = mostVibrant;
            resolve(`rgb(${r}, ${g}, ${b})`);
        } catch (err) {
            resolve(null);
        }
        };

        img.onerror = () => resolve(null);

        const sep = imgUrl.includes('?') ? '&' : '?';
        img.src = `${imgUrl}${sep}cors_bust=${Date.now()}`;
    });

    if (accentColor) {
        document.documentElement.style.setProperty('--cover-color', accentColor);
    }
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

        await applyCoverColor(post);

        const subtitle = post.description ? `<p id="subtitle">${post.description}</p>` : '';
        const date = formatDate(post.pubDate);
        const readingTime = calculateReadingTime(post.content || post.description);

        document.title = `${post.title} | BLOG BY ANTONI`;
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