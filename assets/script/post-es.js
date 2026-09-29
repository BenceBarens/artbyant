const FEED_URL = `https://antonivdgeijn.substack.com/feed`;
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

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

        document.title = `${post.title} | BLOG DE ANTONI`;
        document.getElementById('article-content').innerHTML = `
            <a href="../" class="button2" aria-label="Back to all posts">&larr;</a>
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