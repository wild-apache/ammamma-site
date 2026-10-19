const AMMAMMA_CATALOG_API = 'https://ammamma.floot.app/_api/catalog';

function catalogSlug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function catalogEscape(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
}

function storefrontCategoryName(category) {
    return String(category || '').trim().toLowerCase() === 'powders'
        ? 'Spice Powders'
        : String(category || '').trim();
}

function getCategorySections() {
    return Array.from(document.querySelectorAll('.product-category-header')).map(header => ({
        name: header.querySelector('.category-title')?.textContent?.trim() || '',
        header,
        grid: header.nextElementSibling
    })).filter(section => section.name && section.grid?.classList.contains('products-grid'));
}

function ensureCategorySection(category) {
    const existing = getCategorySections().find(section => section.name === category);
    if (existing) return existing.grid;

    const productsSection = document.querySelector('.products-section .container');
    if (!productsSection) return null;

    const slug = catalogSlug(category);
    const header = document.createElement('div');
    header.className = 'product-category-header';
    header.id = slug;
    header.innerHTML =
        '<h2 class="category-title">' + catalogEscape(category) + '</h2>' +
        '<p class="category-description">Traditional favorites from Ammamma</p>';

    const grid = document.createElement('div');
    grid.className = 'products-grid';
    productsSection.appendChild(header);
    productsSection.appendChild(grid);
    return grid;
}

function renderLiveCatalog(products) {
    const sections = getCategorySections();
    const grids = new Set(sections.map(section => section.grid));

    grids.forEach(grid => {
        grid.innerHTML = '';
    });

    products.forEach((product, productIndex) => {
        const grid = ensureCategorySection(storefrontCategoryName(product.category));
        if (!grid) return;

        const slug = catalogSlug(product.slug || product.name) || ('product-' + productIndex);
        const image = product.imageUrl || '';
        const variants = product.variants || [];
        if (!variants.length) return;

        const quantityName = 'qty-live-' + slug;
        const variantLabels = variants.map((variant, index) => {
            const price = Number(variant.price);
            const hasValidPrice = Number.isFinite(price) && price > 0;
            const available = Boolean(variant.available) && hasValidPrice;
            const checked = index === variants.findIndex(v => Boolean(v.available) && Number.isFinite(Number(v.price)) && Number(v.price) > 0) && available ? ' checked' : '';
            const disabled = available ? '' : ' disabled';
            const availability = !variant.available ? ' — Out of stock' : (!hasValidPrice ? ' — Price unavailable' : '');
            return '<label><input type="radio" name="' + quantityName + '" value="' + catalogEscape(variant.size) + '" data-price="' + price + '"' + checked + disabled + '> ' +
                catalogEscape(variant.size) + ' — ₹' + price.toLocaleString('en-IN') + availability + '</label>';
        }).join('');

        const firstAvailable = variants.some(variant => Boolean(variant.available) && Number.isFinite(Number(variant.price)) && Number(variant.price) > 0);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.testid = 'product-card-' + slug;
        const detailUrl = 'product.html?slug=' + encodeURIComponent(slug);
        card.innerHTML =
            '<a class="product-card-detail-link" href="' + detailUrl + '" aria-label="View ' + catalogEscape(product.name) + '"><div class="product-image" style="background-image:url(\'' + catalogEscape(image) + '\');"><span class="product-image-text">' + catalogEscape(product.name) + '</span></div></a>' +
            '<div class="product-info">' +
            '<h3 class="product-name"><a class="product-name-link" href="' + detailUrl + '">' + catalogEscape(product.name) + '</a></h3>' +
            '<p class="product-desc">' + catalogEscape(product.description || '') + '</p>' +
            '<div class="quantity-selector">' + variantLabels + '</div>' +
            '<button class="btn btn-cart" type="button"' + (firstAvailable ? '' : ' disabled') + '>' + (firstAvailable ? 'Add to Cart' : 'Out of Stock') + '</button>' +
            '</div>';

        const button = card.querySelector('.btn-cart');
        if (firstAvailable) {
            button.addEventListener('click', () => addToCart(product.name, quantityName));
        }
        card.style.cursor = 'pointer';
        card.addEventListener('click', event => {
            if (event.target.closest('a, button, input, label, select')) return;
            window.location.href = detailUrl;
        });
        grid.appendChild(card);
    });
}

function showCatalogStatus(message, retry = false) {
    const section = document.querySelector('.products-section');
    const container = section?.querySelector('.container');
    if (!section || !container) return;
    container.hidden = true;
    let status = document.getElementById('liveCatalogStatus');
    if (!status) {
        status = document.createElement('div');
        status.id = 'liveCatalogStatus';
        status.className = 'container catalog-status';
        status.setAttribute('role', 'status');
        status.style.cssText = 'padding:2rem 1rem;text-align:center;min-height:180px;color:#123524;';
        section.insertAdjacentElement('beforebegin', status);
    }
    status.hidden = false;
    status.textContent = message;
    if (retry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-primary';
        button.textContent = 'Retry loading products';
        button.style.marginTop = '1rem';
        button.addEventListener('click', loadLiveCatalog);
        status.appendChild(document.createElement('br'));
        status.appendChild(button);
    }
}

function decorateStaticProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        const nameNode = card.querySelector('.product-name');
        const imageNode = card.querySelector('.product-image');
        const name = nameNode?.textContent?.trim();
        if (!name) return;
        const slug = catalogSlug(name.replace(/\s*\[(?:Seasonal Availability)\]\s*/i, ''));
        const url = 'product.html?slug=' + encodeURIComponent(slug);
        card.style.cursor = 'pointer';
        card.addEventListener('click', event => {
            if (event.target.closest('a, button, input, label, select')) return;
            window.location.href = url;
        });
        if (imageNode && !imageNode.closest('a')) {
            const link = document.createElement('a');
            link.className = 'product-card-detail-link';
            link.href = url;
            link.setAttribute('aria-label', 'View ' + name);
            imageNode.parentNode.insertBefore(link, imageNode);
            link.appendChild(imageNode);
        }
        if (nameNode && !nameNode.querySelector('a')) {
            const link = document.createElement('a');
            link.className = 'product-name-link';
            link.href = url;
            link.textContent = name;
            nameNode.textContent = '';
            nameNode.appendChild(link);
        }
    });
}

async function loadLiveCatalog() {
    const section = document.querySelector('.products-section');
    const container = section?.querySelector('.container');
    if (container) container.hidden = true;
    showCatalogStatus('Loading the latest products and prices…');
    try {
        const response = await fetch(AMMAMMA_CATALOG_API, { cache: 'no-store' });
        if (!response.ok) throw new Error('Catalog request failed');
        const raw = JSON.parse(await response.text());
        const payload = raw?.json ?? raw;
        if (!payload || !Array.isArray(payload.products)) throw new Error('Invalid catalog response');
        if (container) container.hidden = false;
        const status = document.getElementById('liveCatalogStatus');
        if (status) status.hidden = true;
        renderLiveCatalog(payload.products);
        if (!payload.products.length) showCatalogStatus('No products are currently available. Please check back soon.');
    } catch (error) {
        console.warn('Ammamma live catalog unavailable; ordering is paused to avoid showing stale prices.', error);
        showCatalogStatus('We could not load the latest product prices. Ordering is temporarily unavailable so we do not show incorrect prices. Please try again.', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    decorateStaticProductCards();
    loadLiveCatalog();
});
