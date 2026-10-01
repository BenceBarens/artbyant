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
        document.getElementById('title').textContent = "No article was specified";
        document.getElementById('article-content').innerHTML = `<p id="subtitle">Choose an article from the blog catalogue or open Antoni's profile on Substack.</p>`
        return;
    }

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const post = data.items.find(item => item.link.includes(targetSlug));

        if (!post) {
            document.getElementById('title').textContent = "Article could not be found";
            document.getElementById('article-content').innerHTML = `<p id="subtitle">The article may have been removed. Please choose another article from the blog catalogue or open Antoni's profile on Substack.</p>`
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

        document.getElementById('meta').innerHTML = `${readingTime} min read • Posted on <time datetime="${post.pubDate}">${date}</time>`
        document.getElementById('title').textContent = post.title;

        document.getElementById('article-content').innerHTML = `
            ${subtitle}
            <div>${post.content || post.description}</div>
        `;

        document.getElementById('atag-substack').href = `https://antonivdgeijn.substack.com/p/${targetSlug}`;

    } catch (err) {
        document.getElementById('title').textContent = "An issue occured while loading this article";
        document.getElementById('article-content').innerHTML = `<p id="subtitle">Please try again or try reading the article from Antoni's profile on Substack. If this issue keeps occuring, please <a href="mailto:artbyant@bencebarens.nl?subject=Art%20by%20Ant%20${err}">let us know.</a></p><p>${err}</p>`
    }
}

loadPost();