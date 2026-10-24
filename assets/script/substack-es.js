const API_URL = `https://substack-proxy.artbyant.workers.dev`;

function calculateReadingTime(htmlString) {
    if (!htmlString) return '1';
    const cleanText = htmlString.replace(/<[^>]*>?/gm, ' ').trim();
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    return Math.ceil(words.length / 230);
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

async function loadSubstackFeed() {
    const container = document.getElementById('feed-container');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener los datos del servidor.');

        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');

        if (xmlDoc.querySelector('parsererror')) {
            throw new Error('Error al procesar el XML del feed.');
        }

        const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => {
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const content = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent 
                         || item.querySelector('description')?.textContent 
                         || '';
            const description = item.querySelector('description')?.textContent || '';

            return { title, link, pubDate, content, description };
        });

        container.innerHTML = items.map(item => {
            const postDate = new Date(item.pubDate);
            const isCurrentYear = postDate.getFullYear() === new Date().getFullYear();

            const date = postDate.toLocaleDateString('es-ES', {
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
                        <div class="meta">Lectura de ${readingTime} min • Publicado el <time datetime="${item.pubDate}">${date}</time></div>
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
        container.innerHTML = `<p style="text-align:center;">Lo sentimos, estamos teniendo problemas para mostrar los artículos en este momento.<br>Por favor, visita la <a href="https://antonivdgeijn.substack.com/profile/posts" target="_blank" style="text-decoration:underline;">página de Substack de Antoni</a> para leer su blog.<br><br>Error: ${error.message}</p>`;
    }
}

loadSubstackFeed();