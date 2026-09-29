const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

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

    return postDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        ...(isCurrentYear ? {} : { year: 'numeric' })
    });
}

async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const targetSlug = params.get('slug');

    if (!targetSlug) {
        document.getElementById('article-content').innerHTML = '<p>No se encontró ningún artículo.</p>';
        return;
    }

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const post = data.items.find(item => item.link.includes(targetSlug));

        if (!post) {
            document.getElementById('article-content').innerHTML = '<p>No se encontró ningún artículo.</p>';
            return;
        }

        const subtitle = post.description ? `<p id="subtitle">${post.description}</p>` : '';
        const date = formatDate(post.pubDate);
        const readingTime = calculateReadingTime(post.content || post.description);

        document.title = `${post.title} | BLOG DE ANTONI`;
        document.getElementById('article-content').innerHTML = `
            <a href="../" class="button2" aria-label="Back to all posts">&larr;</a>
            <span class="meta">Lectura de ${readingTime} min • Publicado el <time datetime="${post.pubDate}">${date}</time></span>
            <h1>${post.title}</h1>
            ${subtitle}
            <div class="body">${post.content || post.description}</div>
            <br><br>
            <a href="../" class="button">Volver al blog</a> 
            <a href="https://antonivdgeijn.substack.com/p/${targetSlug}" target="_blank" rel="noopener" class="button2">Abierto en Substack</a>
        `;
    } catch (err) {
        document.getElementById('article-content').innerHTML = '<p>Error al cargar el artículo.</p>';
    }
}

loadPost();