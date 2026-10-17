(() => {
  const API = 'https://ammamma.floot.app/_api/catalog';
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = (params.get('slug') || '').toLowerCase();
  const main = document.getElementById('productDetailMain');
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const slugify = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
  const categoryName = value => String(value || '').toLowerCase() === 'powders' ? 'Spice Powders' : String(value || 'Products');
  const availableVariants = product => (product.variants || []).filter(v => v.available);
  const imageFor = product => product.imageUrl || '';
  const status = message => { main.innerHTML = '<div class="container"><p class="product-detail-status" role="status">' + esc(message) + '</p><p><a href="products.html">Back to all products</a></p></div>'; };
  const addSchema = (product, variants, groupName) => variants.map((variant, i) =>
    '<label class="detail-variant"><input type="radio" name="' + esc(groupName) + '" value="' + esc(variant.size) + '" data-price="' + Number(variant.price || 0) + '"' + (i === 0 ? ' checked' : '') + '> <span>' + esc(variant.size) + '</span><strong>' + money(variant.price) + '</strong></label>'
  ).join('');
  const field = (label, value) => value ? '<section class="detail-info-block"><h3>' + esc(label) + '</h3><p>' + esc(value) + '</p></section>' : '';
  function renderProduct(product, products) {
    const slug = slugify(product.slug || product.name);
    const category = categoryName(product.category);
    const variants = product.variants || [];
    const available = availableVariants(product);
    const group = 'detail-variant-' + slug;
    document.title = product.name + ' | ammamma.shop';
    const description = product.description || '';
    const canonicalUrl = window.location.origin + window.location.pathname + '?slug=' + encodeURIComponent(slug);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description || ('Discover ' + product.name + ' from ammamma.shop.');
    const related = products.filter(item => item !== product && item.name !== product.name &&
      (String(item.category || '').toLowerCase() === String(product.category || '').toLowerCase())).slice(0, 10);
    const story = [
      ['Farm-Sourced Ingredients', 'We carefully select ingredients from farms and trusted suppliers. Product-specific sourcing details can be added when verified.'],
      ['Prepared with Care', 'Ingredients are handled with attention to detail. The exact preparation and drying method should be confirmed for each product.'],
      ['Handcrafted with Care', 'Our traditional range is presented with care. Add authentic preparation and packing photos here when available.']
    ];
    const storyIcons = ['🌿','🥣','🏡'];
    main.innerHTML = '<div class="container">' +
      '<nav class="product-breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>›</span><a href="products.html">Products</a><span>›</span><span aria-current="page">' + esc(product.name) + '</span></nav>' +
      '<section class="product-detail-hero"><div class="detail-gallery"><div class="detail-image-wrap">' +
      (imageFor(product) ? '<img class="detail-main-image" src="' + esc(imageFor(product)) + '" alt="' + esc(product.name) + '" loading="eager">' : '<div class="detail-image-placeholder">Product image unavailable</div>') +
      '</div><p class="detail-image-caption">Product image</p></div>' +
      '<div class="detail-purchase"><p class="detail-category">' + esc(category) + '</p><h1>' + esc(product.name) + '</h1>' +
      (description ? '<p class="detail-short-description">' + esc(description) + '</p>' : '') +
      (available.length ? '<p class="detail-price" id="detailPrice">' + money(available[0].price) + '</p><fieldset class="detail-variants"><legend>Choose pack size</legend>' + addSchema(product, available, group) + '</fieldset>' :
      '<p class="detail-out-of-stock">Currently unavailable</p>') +
      '<div class="detail-quantity"><label for="detailQuantity">Quantity</label><div class="detail-quantity-controls"><button type="button" id="quantityMinus" aria-label="Decrease quantity">−</button><input id="detailQuantity" type="number" min="1" max="20" value="1" inputmode="numeric"><button type="button" id="quantityPlus" aria-label="Increase quantity">+</button></div></div>' +
      '<button class="btn btn-cart detail-add-button" id="detailAddToCart" type="button"' + (available.length ? '' : ' disabled') + '>' + (available.length ? 'Add to Cart' : 'Out of Stock') + '</button>' +
      '<p class="detail-safe-note">Your selected pack size and price will be added to the existing shopping cart.</p></div></section>' +
      '<section class="detail-description-section"><h2>About this product</h2>' + (description ? '<p>' + esc(description) + '</p>' : '<p>Product description has not yet been provided.</p>') +
      field('Ingredients', product.ingredients) + field('Taste & flavour', product.flavorProfile || product.flavourProfile) +
      field('Preparation method', product.preparationMethod) + field('Shelf life', product.shelfLife || product.shelf_life) +
      field('Storage instructions', product.storageInstructions || product.storage) + field('Allergen information', product.allergens) +
      field('Dietary information', product.dietaryInfo || product.dietary_information) +
      '<div class="detail-info-block"><h3>Serving suggestions</h3><p>' + esc(String(product.category || '').toLowerCase() === 'pickles' ? 'Enjoy with rice, curd rice, dosa or idli, according to your taste.' : String(product.category || '').toLowerCase() === 'powders' ? 'Mix with hot rice and ghee, or enjoy as an accompaniment to idli and dosa.' : String(product.category || '').toLowerCase() === 'ghee' ? 'Serve with hot rice, dal or your favourite home-cooked dishes.' : 'Enjoy as part of your favourite home-cooked meal.') + '</p></div></section>' +
      '<section class="brand-story"><div class="brand-story-intro"><p class="detail-eyebrow">The Ammamma way</p><h2>From Our Farms to Your Table</h2><p>Every product reflects our appreciation for traditional flavours and careful preparation. We are building this story around verified practices and will add authentic brand photography as it becomes available.</p></div><div class="brand-story-grid">' +
      story.map((item, i) => '<article class="brand-story-card"><div class="brand-story-placeholder" aria-hidden="true"><span>' + storyIcons[i] + '</span><small>Authentic brand photo to be added</small></div><div class="brand-story-copy"><h3>' + esc(item[0]) + '</h3><p>' + esc(item[1]) + '</p></div></article>').join('') +
      '</div></section>' +
      '<section class="related-products"><div class="related-heading"><div><p class="detail-eyebrow">Explore more</p><h2>You May Also Love</h2></div><div class="related-controls"><button type="button" id="relatedPrev" aria-label="Scroll related products left">←</button><button type="button" id="relatedNext" aria-label="Scroll related products right">→</button></div></div>' +
      (related.length ? '<div class="related-track" id="relatedTrack">' + related.map((item, i) => {
        const itemSlug = slugify(item.slug || item.name);
        const itemVariants = availableVariants(item);
        const qname = 'related-' + itemSlug;
        const startPrice = itemVariants.length ? Math.min(...itemVariants.map(v => Number(v.price) || 0)) : null;
        return '<article class="related-card"><a class="related-card-link" href="product.html?slug=' + encodeURIComponent(itemSlug) + '">' +
          (imageFor(item) ? '<img src="' + esc(imageFor(item)) + '" alt="' + esc(item.name) + '" loading="lazy">' : '<div class="related-image-placeholder">Image unavailable</div>') +
          '<h3>' + esc(item.name) + '</h3></a><p>' + esc(item.description || '') + '</p>' +
          (startPrice !== null ? '<strong class="related-price">From ' + money(startPrice) + '</strong>' : '<strong class="related-price">Price unavailable</strong>') +
          (itemVariants.length ? '<label class="related-size-label" for="' + qname + '">Pack size</label><select id="' + qname + '" class="related-size-select">' + itemVariants.map(v => '<option value="' + esc(v.size) + '" data-price="' + Number(v.price || 0) + '">' + esc(v.size) + ' — ' + money(v.price) + '</option>').join('') + '</select><button type="button" class="btn btn-cart related-add" data-product="' + esc(item.name) + '" data-select="' + qname + '">Add to Cart</button>' :
          '<button type="button" class="btn btn-cart" disabled>Out of Stock</button>') + '</article>';
      }).join('') + '</div>' : '<p class="related-empty">More products in this category will appear here when available.</p>') +
      '</section></div>';
    main.querySelectorAll('input[name="' + group + '"]').forEach(input => input.addEventListener('change', () => {
      const selected = main.querySelector('input[name="' + group + '"]:checked');
      if (selected) document.getElementById('detailPrice').textContent = money(selected.dataset.price);
    }));
    const qtyInput = document.getElementById('detailQuantity');
    document.getElementById('quantityMinus').addEventListener('click', () => qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1));
    document.getElementById('quantityPlus').addEventListener('click', () => qtyInput.value = Math.min(20, Number(qtyInput.value || 1) + 1));
    qtyInput.addEventListener('change', () => qtyInput.value = Math.min(20, Math.max(1, Math.floor(Number(qtyInput.value || 1)))));
    document.getElementById('detailAddToCart').addEventListener('click', () => {
      const qty = Math.min(20, Math.max(1, Math.floor(Number(qtyInput.value || 1))));
      qtyInput.value = qty;
      addToCart(product.name, group, qty);
    });
    document.getElementById('relatedPrev')?.addEventListener('click', () => document.getElementById('relatedTrack')?.scrollBy({left:-280,behavior:'smooth'}));
    document.getElementById('relatedNext')?.addEventListener('click', () => document.getElementById('relatedTrack')?.scrollBy({left:280,behavior:'smooth'}));
    main.querySelectorAll('.related-add').forEach(button => button.addEventListener('click', () => {
      const select = document.getElementById(button.dataset.select);
      const groupName = 'related-radio-' + slugify(button.dataset.product);
      let hidden = document.getElementById(groupName);
      if (!hidden) {
        hidden = document.createElement('input'); hidden.type = 'radio'; hidden.checked = true; hidden.style.display = 'none'; hidden.id = groupName; hidden.name = groupName; document.body.appendChild(hidden);
      }
      hidden.value = select.value;
      hidden.dataset.price = select.selectedOptions[0]?.dataset.price || '';
      addToCart(button.dataset.product, groupName);
    }));
    const productJson = {
      '@context':'https://schema.org', '@type':'Product', name:product.name, description:description,
      image:imageFor(product) || undefined,
      offers: available.map(v => ({'@type':'Offer', priceCurrency:'INR', price:Number(v.price), availability:'https://schema.org/InStock', url:canonicalUrl}))
    };
    const structured = document.createElement('script'); structured.type='application/ld+json'; structured.textContent=JSON.stringify(productJson); document.head.appendChild(structured);
  }
  async function init() {
    if (!requestedSlug) { status('No product was selected. Please choose a product from the catalog.'); return; }
    try {
      const response = await fetch(API, {cache:'no-store'});
      if (!response.ok) throw new Error('Catalog request failed');
      const raw = await response.json();
      const payload = raw?.json ?? raw;
      if (!Array.isArray(payload?.products)) throw new Error('Invalid catalog response');
      const products = payload.products;
      const product = products.find(p => slugify(p.slug || p.name) === requestedSlug);
      if (!product) { status('We could not find that product in the current catalog.'); return; }
      renderProduct(product, products);
    } catch (error) {
      console.error('Unable to load product details', error);
      status('Product details are temporarily unavailable. Please return to the product catalog and try again.');
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();