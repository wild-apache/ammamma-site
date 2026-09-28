const AMMAMMA_CATALOG_API = 'https://ammamma.floot.app/_api/catalog';

function catalogSlug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function catalogEscape(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
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
        const grid = ensureCategorySection(product.category);
        if (!grid) return;

        const slug = catalogSlug(product.slug || product.name) || ('product-' + productIndex);
        const image = product.imageUrl || '';
        const variants = product.variants || [];
        if (!variants.length) return;

        const quantityName = 'qty-live-' + slug;
        const variantLabels = variants.map((variant, index) => {
            const price = Number(variant.price) || 0;
            const available = Boolean(variant.available);
            const checked = index === 0 && available ? ' checked' : '';
            const disabled = available ? '' : ' disabled';
            const availability = available ? '' : ' — Out of stock';
            return '<label><input type="radio" name="' + quantityName + '" value="' + catalogEscape(variant.size) + '" data-price="' + price + '"' + checked + disabled + '> ' +
                catalogEscape(variant.size) + ' — ₹' + price.toLocaleString('en-IN') + availability + '</label>';
        }).join('');

        const firstAvailable = variants.some(variant => Boolean(variant.available));
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.testid = 'product-card-' + slug;
        card.innerHTML =
            '<div class="product-image" style="background-image:url(\'' + catalogEscape(image) + '\');"><span class="product-image-text">' + catalogEscape(product.name) + '</span></div>' +
            '<div class="product-info">' +
            '<h3 class="product-name">' + catalogEscape(product.name) + '</h3>' +
            '<p class="product-desc">' + catalogEscape(product.description || '') + '</p>' +
            '<div class="quantity-selector">' + variantLabels + '</div>' +
            '<button class="btn btn-cart" type="button"' + (firstAvailable ? '' : ' disabled') + '>' + (firstAvailable ? 'Add to Cart' : 'Out of Stock') + '</button>' +
            '</div>';

        const button = card.querySelector('.btn-cart');
        if (firstAvailable) {
            button.addEventListener('click', () => addToCart(product.name, quantityName));
        }
        grid.appendChild(card);
    });
}

async function loadLiveCatalog() {
    try {
        const response = await fetch(AMMAMMA_CATALOG_API, { cache: 'no-store' });
        if (!response.ok) throw new Error('Catalog request failed');
        const raw = JSON.parse(await response.text());
        const payload = raw?.json ?? raw;
        if (!payload || !Array.isArray(payload.products)) throw new Error('Invalid catalog response');
        renderLiveCatalog(payload.products);
    } catch (error) {
        console.warn('Ammamma live catalog unavailable; keeping static catalog.', error);
    }
}

document.addEventListener('DOMContentLoaded', loadLiveCatalog);
