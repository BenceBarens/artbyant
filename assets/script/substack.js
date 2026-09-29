const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

async function loadSubstackFeed() {
    const container = document.getElementById('feed-container');

    function calculateReadingTime(htmlString) {
        if (!htmlString) return '1';

        const cleanText = htmlString.replace(/<[^>]*>?/gm, ' ').trim();

        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        const wordsPerMinute = 230;
        const minutes = Math.ceil(wordCount / wordsPerMinute);

        return minutes;
    }

    function extractFirstImage(htmlString) {
        if (!htmlString) return null;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const img = doc.querySelector('img');
        
        return img ? img.src : null;
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

        const readingTime = calculateReadingTime(item.content || item.description);

        const cleanText = item.description.replace(/<[^>]*>?/gm, '').trim();
        const excerpt = cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;

        const imageUrl = item.thumbnail || extractFirstImage(item.content || item.description);

        const slug = new URL(item.link).pathname.split('/').filter(Boolean).pop();
        const myPostUrl = `p?slug=${encodeURIComponent(slug)}`;

        const imageHtml = imageUrl 
            ? `<img src="${imageUrl}" alt="${item.title}" loading="lazy">` 
            : '';

        return `
            <li data-image="${imageUrl || ''}"><a href="${myPostUrl}"><article class="post">
                <div>
                    <div class="meta">${readingTime} min read • Posted on <time datetime="${item.pubDate}">${date}</time></div>
                    <h2>${item.title}</h2>
                    <p>${excerpt}</p>
                </div>
                ${imageHtml}
            </article></a></li>
        `;
        }).join('');

        container.querySelectorAll('li[data-image]').forEach(li => {
            const url = li.dataset.image;
            if (url) setVibrantColor(url, li);
        });

    } catch (error) {
        container.innerHTML = `<p>Couldn't load articles: ${error.message}</p>`;
    }
}

loadSubstackFeed();