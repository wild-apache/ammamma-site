let cart = [];

/* ---------- Storage ---------- */
function loadCart() {
    const saved = localStorage.getItem('ammaCart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('ammaCart', JSON.stringify(cart));
}

/* ---------- Cart Actions ---------- */
function addToCart(productName, qtyGroup) {
    const quantity = document.querySelector(
        `input[name="${qtyGroup}"]:checked`
    ).value;

    const exists = cart.find(
        item => item.name === productName && item.quantity === quantity
    );

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
    cart = cart.filter(
        item => !(item.name === name && item.quantity === quantity)
    );
    saveCart();
    updateCartCount();
    renderCartItems();
}

/* ---------- UI ---------- */
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

function renderCartItems() {
    const container = document.getElementById('cartItems');

    if (!cart.length) {
        container.innerHTML = `<div class="cart-empty">Cart is empty</div>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span class="cart-item-name">
                ${item.name} <small>(${item.quantity})</small>
            </span>
            <button class="cart-item-remove"
                onclick="removeFromCart('${item.name}','${item.quantity}')">
                ×
            </button>
        </div>
    `).join('');
}

function handleAddressInput() {
    const address = document.getElementById('customerAddress').value.trim();
    const whatsappBtn = document.getElementById('whatsappOrder');

    whatsappBtn.disabled = address.length === 0;
}


/* ---------- WhatsApp ---------- */
/* function proceedToWhatsApp() {
    if (!cart.length) {
        showNotification('Add items first');
        return;
    }

    const message = cart
        .map(i => `${i.name} (${i.quantity})`)
        .join(', ');

    const url = `https://api.whatsapp.com/send/?phone=+918686981272&text=${encodeURIComponent(
        'Hi, I would like to order: ' + message
    )}`;

    window.open(url, '_blank');
} */

/*----------- Whatsapp updated with Address*/

function proceedToWhatsApp() {
    if (!cart.length) {
        showNotification('Add items first');
        return;
    }

    const address = document.getElementById('customerAddress').value.trim();
    if (!address) {
        showNotification('Please enter delivery address');
        return;
    }

    // Each product on a new line
    const itemsList = cart
        .map(item => `• ${item.name} (${item.quantity})`)
        .join('\n');

    const message =
        `Hi, I would like to place an order.\n\n` +
        `🛒 *Items Ordered:*\n` +
        `${itemsList}\n\n` +
        `📍 *Delivery Address:*\n` +
        `${address}`;

    const whatsappURL =
        `https://api.whatsapp.com/send/?phone=+918686981272&text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
}



/* ---------- Modal ---------- */
function openCart() {
    renderCartItems();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

/* ---------- Notifications ---------- */
function showNotification(msg) {
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = `
        position:fixed;top:90px;right:20px;
        background:#123524;color:#fff;
        padding:12px 16px;border-radius:10px;
        z-index:9999;
    `;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2500);
}

/* ---------- Events ---------- */
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    document.getElementById('cartIcon').onclick = openCart;
    document.getElementById('closeCart').onclick = closeCart;
    document.getElementById('whatsappOrder').onclick = proceedToWhatsApp;
    const addressInput = document.getElementById('customerAddress');
const whatsappBtn = document.getElementById('whatsappOrder');

if (addressInput) {
    addressInput.addEventListener('input', handleAddressInput);
    whatsappBtn.disabled = true; // default state
}
});
