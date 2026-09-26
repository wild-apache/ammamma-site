const AMMAMMA_CATALOG_API = 'https://4aa221a2-f17e-418d-ab74-9dbdfc68f5a1.sandbox.floot.app/_api/catalog';

function catalogSlug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function catalogEscape(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
}

function renderLiveCatalog(products) {
    const groups = {
        'Powders': document.querySelector('#spice-powders')?.nextElementSibling,
        'Pickles': document.querySelector('#pickles')?.nextElementSibling,
        'Pure Ghee': document.querySelector('#ghee')?.nextElementSibling
    };

    Object.values(groups).forEach(grid => {
        if (grid) grid.innerHTML = '';
    });

    products.forEach((product, productIndex) => {
        const grid = groups[product.category];
        if (!grid) return;

        const slug = catalogSlug(product.slug || product.name) || ('product-' + productIndex);
        const image = product.imageUrl || '';
        const variants = (product.variants || []).filter(v => v.available || v.stockQuantity >= 0);
        if (!variants.length) return;

        const quantityName = 'qty-live-' + slug;
        const variantLabels = variants.map((variant, index) => {
            const price = Number(variant.price) || 0;
            const checked = index === 0 ? ' checked' : '';
            const disabled = variant.available ? '' : ' disabled';
            const availability = variant.available ? '' : ' — Out of stock';
            return '<label><input type="radio" name="' + quantityName + '" value="' + catalogEscape(variant.size) + '" data-price="' + price + '"' + checked + disabled + '> ' +
                catalogEscape(variant.size) + ' — ₹' + price.toLocaleString('en-IN') + availability + '</label>';
        }).join('');

        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.testid = 'product-card-' + slug;
        card.innerHTML =
            '<div class="product-image" style="background-image:url(\'' + catalogEscape(image) + '\');"><span class="product-image-text">' + catalogEscape(product.name) + '</span></div>' +
            '<div class="product-info">' +
            '<h3 class="product-name">' + catalogEscape(product.name) + '</h3>' +
            '<p class="product-desc">' + catalogEscape(product.description || '') + '</p>' +
            '<div class="quantity-selector">' + variantLabels + '</div>' +
            '<button class="btn btn-cart" type="button">Add to Cart</button>' +
            '</div>';

        const button = card.querySelector('.btn-cart');
        button.addEventListener('click', () => addToCart(product.name, quantityName));
        grid.appendChild(card);
    });
}

async function loadLiveCatalog() {
    try {
        const response = await fetch(AMMAMMA_CATALOG_API, { cache: 'no-store' });
        if (!response.ok) throw new Error('Catalog request failed');
        const payload = JSON.parse(await response.text());
        if (!payload || !Array.isArray(payload.products)) throw new Error('Invalid catalog response');
        renderLiveCatalog(payload.products);
    } catch (error) {
        console.warn('Ammamma live catalog unavailable; keeping static catalog.', error);
    }
}

document.addEventListener('DOMContentLoaded', loadLiveCatalog);
