let cart = [];

/* ---------- Mobile experience ---------- */
function loadMobileStyles() {
    if (document.getElementById('ammammaMobileStyles')) return;
    const link = document.createElement('link');
    link.id = 'ammammaMobileStyles';
    link.rel = 'stylesheet';
    link.href = 'mobile.css';
    document.head.appendChild(link);
}

function setupMobileNavigation() {
    const headerContent = document.querySelector('.header-content');
    const nav = document.querySelector('.nav');
    if (!headerContent || !nav || document.getElementById('mobileMenuToggle')) return;

    const toggle = document.createElement('button');
    toggle.id = 'mobileMenuToggle';
    toggle.className = 'mobile-menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span>';

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-backdrop';
    backdrop.id = 'mobileMenuBackdrop';

    const panel = document.createElement('nav');
    panel.className = 'mobile-nav-panel';
    panel.id = 'mobileNavPanel';
    panel.setAttribute('aria-label', 'Mobile navigation');

    nav.querySelectorAll('a').forEach(link => {
        const clone = link.cloneNode(true);
        panel.appendChild(clone);
    });

    const closeMenu = () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        panel.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
    };

    const openMenu = () => {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
        panel.classList.add('active');
        backdrop.classList.add('active');
        document.body.classList.add('mobile-menu-open');
    };

    toggle.addEventListener('click', () => {
        toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    panel.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });

    headerContent.appendChild(toggle);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
}

function setupMobileCartBar() {
    if (document.getElementById('mobileCartBar')) return;

    const bar = document.createElement('div');
    bar.className = 'mobile-cart-bar';
    bar.id = 'mobileCartBar';
    bar.innerHTML = `
        <button type="button" class="mobile-cart-bar__cart" id="mobileCartButton" aria-label="Open shopping cart">
            Cart · <span id="mobileCartCount">0</span>
        </button>
        <button type="button" class="mobile-cart-bar__whatsapp" id="mobileWhatsAppButton" aria-label="Order on WhatsApp">
            WhatsApp Order
        </button>
    `;
    document.body.appendChild(bar);

    document.getElementById('mobileCartButton').addEventListener('click', openCart);
    document.getElementById('mobileWhatsAppButton').addEventListener('click', () => {
        openCart();
        setTimeout(() => document.getElementById('customerAddress')?.focus(), 80);
    });
}

function updateMobileCartBar() {
    const bar = document.getElementById('mobileCartBar');
    const count = document.getElementById('mobileCartCount');
    if (!bar || !count) return;
    count.textContent = cart.length;
    bar.classList.toggle('has-items', cart.length > 0);
}

/* ---------- Storage ---------- */
function loadCart() {
    try {
        const saved = localStorage.getItem('ammaCart');
        if (saved) cart = JSON.parse(saved);
    } catch (error) {
        cart = [];
    }
    updateCartCount();
    updateMobileCartBar();
}

function saveCart() {
    localStorage.setItem('ammaCart', JSON.stringify(cart));
}

/* ---------- Cart Actions ---------- */
function addToCart(productName, qtyGroup) {
    const selected = document.querySelector(`input[name="${qtyGroup}"]:checked`);
    if (!selected) {
        showNotification('Please select a quantity');
        return;
    }

    const quantity = selected.value;
    const exists = cart.find(item => item.name === productName && item.quantity === quantity);

    if (!exists) {
        cart.push({ name: productName, quantity });
        saveCart();
        updateCartCount();
        showNotification(`${productName} (${quantity}) added`);
    } else {
        showNotification(`${productName} (${quantity}) already in cart`);
    }
}

function removeFromCart(name, quantity) {
    cart = cart.filter(item => !(item.name === name && item.quantity === quantity));
    saveCart();
    updateCartCount();
    renderCartItems();
}

/* ---------- UI ---------- */
function updateCartCount() {
    const count = document.getElementById('cartCount');
    if (count) count.textContent = cart.length;
    updateMobileCartBar();
}

function ensureAddressField() {
    const footer = document.querySelector('.cart-footer');
    if (!footer || document.getElementById('customerAddress')) return;

    const field = document.createElement('textarea');
    field.id = 'customerAddress';
    field.className = 'cart-address-field';
    field.placeholder = 'Delivery address';
    field.setAttribute('aria-label', 'Delivery address');
    field.rows = 3;

    const button = document.getElementById('whatsappOrder');
    footer.insertBefore(field, button);
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (!cart.length) {
        container.innerHTML = '<div class="cart-empty">Your cart is empty.<br><small>Add something delicious to get started.</small></div>';
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <span class="cart-item-name">${escapeHtml(item.name)} <small>(${escapeHtml(item.quantity)})</small></span>
            <button class="cart-item-remove" data-cart-index="${index}" aria-label="Remove ${escapeHtml(item.name)}">×</button>
        </div>
    `).join('');

    container.querySelectorAll('[data-cart-index]').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.cartIndex);
            if (Number.isInteger(index) && cart[index]) {
                removeFromCart(cart[index].name, cart[index].quantity);
            }
        });
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
}

function handleAddressInput() {
    const address = document.getElementById('customerAddress')?.value.trim() || '';
    const whatsappBtn = document.getElementById('whatsappOrder');
    if (whatsappBtn) whatsappBtn.disabled = address.length === 0 || cart.length === 0;
}

/* ---------- WhatsApp ---------- */
function proceedToWhatsApp() {
    if (!cart.length) {
        showNotification('Add items first');
        return;
    }

    const address = document.getElementById('customerAddress')?.value.trim() || '';
    if (!address) {
        showNotification('Please enter delivery address');
        document.getElementById('customerAddress')?.focus();
        return;
    }

    const itemsList = cart.map(item => `• ${item.name} (${item.quantity})`).join('\n');
    const message =
        `Hi, I would like to place an order.\n\n` +
        `🛒 *Items Ordered:*\n${itemsList}\n\n` +
        `📍 *Delivery Address:*\n${address}`;

    const whatsappURL = `https://api.whatsapp.com/send/?phone=+918686981272&text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank', 'noopener');
}

/* ---------- Modal ---------- */
function openCart() {
    ensureAddressField();
    renderCartItems();
    handleAddressInput();
    document.getElementById('cartModal')?.classList.add('active');
    document.body.classList.add('cart-open');
}

function closeCart() {
    document.getElementById('cartModal')?.classList.remove('active');
    document.body.classList.remove('cart-open');
}

/* ---------- Notifications ---------- */
function showNotification(msg) {
    const existing = document.querySelector('.ammamma-toast');
    if (existing) existing.remove();

    const n = document.createElement('div');
    n.className = 'ammamma-toast';
    n.textContent = msg;
    n.style.cssText = `
        position:fixed;top:76px;left:50%;transform:translateX(-50%);
        max-width:calc(100vw - 28px);background:#123524;color:#fff;
        padding:11px 15px;border-radius:12px;z-index:9999;
        box-shadow:0 8px 24px rgba(0,0,0,.18);font:600 13px/1.3 Inter,sans-serif;
        text-align:center;
    `;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2500);
}

/* ---------- Events ---------- */
document.addEventListener('DOMContentLoaded', () => {
    loadMobileStyles();
    setupMobileNavigation();
    setupMobileCartBar();
    loadCart();

    const cartIcon = document.getElementById('cartIcon');
    const closeCartButton = document.getElementById('closeCart');
    const whatsappButton = document.getElementById('whatsappOrder');

    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (closeCartButton) closeCartButton.addEventListener('click', closeCart);
    if (whatsappButton) whatsappButton.addEventListener('click', proceedToWhatsApp);

    ensureAddressField();
    const addressInput = document.getElementById('customerAddress');
    if (addressInput) {
        addressInput.addEventListener('input', handleAddressInput);
        handleAddressInput();
    }

    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.addEventListener('click', event => {
            if (event.target === modal) closeCart();
        });
    }
});
