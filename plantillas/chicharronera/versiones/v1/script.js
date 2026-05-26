// --- CONFIGURACIÓN PRINCIPAL ---
const CONFIG = {
    phone: "50581878263", // Cambia esto por tu número de WhatsApp
    currency: "C$",
    deliveryMsg: "Hola, quiero realizar el siguiente pedido:"
};

// --- BASE DE DATOS LOCAL (Simulada) ---
const productsData = [
    {
        id: 1,
        name: "Clásica Burger",
        price: 150,
        description: "Carne de res 150g, queso cheddar, lechuga, tomate y nuestra salsa secreta.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
        category: "Hamburguesas",
        badge: "Más vendido"
    },
    {
        id: 2,
        name: "Doble Bacon Smash",
        price: 220,
        description: "Doble carne smash, doble queso, abundante tocino crujiente y cebolla caramelizada.",
        image: "https://images.unsplash.com/photo-1594212202905-2b02e7df6fce?auto=format&fit=crop&w=500&q=80",
        category: "Hamburguesas",
        badge: "Nuevo"
    },
    {
        id: 3,
        name: "Pizza Pepperoni Familiar",
        price: 350,
        description: "Masa artesanal, salsa pomodoro, extra queso mozzarella y pepperoni premium.",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
        category: "Pizzas",
        badge: ""
    },
    {
        id: 4,
        name: "Pizza Hawaiana",
        price: 320,
        description: "Jamón, piña fresca, queso mozzarella y un toque de orégano.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
        category: "Pizzas",
        badge: "Promoción"
    },
    {
        id: 5,
        name: "Combo Pareja",
        price: 450,
        description: "2 Hamburguesas clásicas + 2 Papas fritas + 2 Refrescos de 12oz.",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80",
        category: "Combos",
        badge: "Promoción"
    },
    {
        id: 6,
        name: "Cheesecake de Fresa",
        price: 90,
        description: "Delicioso pastel de queso bañado en mermelada de fresa casera.",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80",
        category: "Postres",
        badge: ""
    },
    {
        id: 7,
        name: "Coca Cola 1L",
        price: 60,
        description: "Botella plástica helada de 1 litro.",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
        category: "Bebidas",
        badge: ""
    }
];

// --- ESTADO DE LA APLICACIÓN ---
let cart = [];
let currentCategory = "Todos";
let activeProductModal = null;
let modalCurrentQuantity = 1;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    renderProducts();
    
    // Evento de búsqueda
    document.getElementById("searchInput").addEventListener("input", (e) => {
        renderProducts(e.target.value);
    });

    // Control del botón volver arriba
    window.addEventListener("scroll", () => {
        const btn = document.getElementById("backToTopBtn");
        if (window.scrollY > 300) btn.classList.add("visible");
        else btn.classList.remove("visible");
    });
});

// --- RENDERIZADO DE INTERFAZ ---

// Extraer categorías únicas y renderizar los botones
function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    const categories = ["Todos", ...new Set(productsData.map(p => p.category))];
    
    container.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `cat-btn ${cat === currentCategory ? "active" : ""}`;
        btn.innerText = cat;
        btn.onclick = () => {
            currentCategory = cat;
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProducts(document.getElementById("searchInput").value);
        };
        container.appendChild(btn);
    });
}

// Renderizar tarjetas de productos
function renderProducts(searchQuery = "") {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    const filteredProducts = productsData.filter(p => {
        const matchCategory = currentCategory === "Todos" || p.category === currentCategory;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">No se encontraron productos.</p>`;
        return;
    }

    filteredProducts.forEach(p => {
        let badgeHtml = p.badge ? `<span class="badge ${p.badge.toLowerCase().replace(' ', '-')}">${p.badge}</span>` : '';
        
        const card = document.createElement("div");
        card.className = "product-card";
        // Al hacer click en la tarjeta se abre el detalle
        card.onclick = () => openModal(p.id);
        
        card.innerHTML = `
            ${badgeHtml}
            <div class="img-container">
                <img src="${p.image}" alt="${p.name}" class="product-img">
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-price">${CONFIG.currency} ${p.price.toFixed(2)}</div>
                <button class="btn-add-card" onclick="event.stopPropagation(); openModal(${p.id})">Agregar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- LOGICA DEL MODAL DE DETALLE ---
function openModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    activeProductModal = product;
    modalCurrentQuantity = 1;

    document.getElementById("modalImage").src = product.image;
    document.getElementById("modalTitle").innerText = product.name;
    document.getElementById("modalDescription").innerText = product.description;
    document.getElementById("modalPrice").innerText = `${CONFIG.currency} ${product.price.toFixed(2)}`;
    document.getElementById("modalQuantity").innerText = modalCurrentQuantity;
    document.getElementById("modalNotes").value = "";

    document.getElementById("productModal").classList.add("active");
}

function closeModal() {
    document.getElementById("productModal").classList.remove("active");
    activeProductModal = null;
}

function changeModalQuantity(delta) {
    if (modalCurrentQuantity + delta >= 1) {
        modalCurrentQuantity += delta;
        document.getElementById("modalQuantity").innerText = modalCurrentQuantity;
    }
}

// --- LOGICA DEL CARRITO ---
function addToCartFromModal() {
    if (!activeProductModal) return;

    const notes = document.getElementById("modalNotes").value.trim();
    
    // Verificar si ya existe en el carrito el mismo producto CON las mismas notas
    const existingIndex = cart.findIndex(item => item.id === activeProductModal.id && item.notes === notes);

    if (existingIndex !== -1) {
        cart[existingIndex].quantity += modalCurrentQuantity;
    } else {
        cart.push({
            id: activeProductModal.id,
            name: activeProductModal.name,
            price: activeProductModal.price,
            image: activeProductModal.image,
            quantity: modalCurrentQuantity,
            notes: notes
        });
    }

    updateCartUI();
    closeModal();
    
    // Pequeño feedback visual en el botón flotante
    const cartBtn = document.getElementById("floatingCartBtn");
    cartBtn.style.transform = "scale(1.2)";
    setTimeout(() => cartBtn.style.transform = "scale(1)", 200);
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartCountDisplay = document.getElementById("cartCount");
    const cartTotalDisplay = document.getElementById("cartTotalDisplay");

    cartItemsContainer.innerHTML = "";
    let totalItems = 0;
    let grandTotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align:center; color:#888; margin-top:20px;">Tu carrito está vacío.</p>`;
    } else {
        cart.forEach((item, index) => {
            totalItems += item.quantity;
            const subtotal = item.price * item.quantity;
            grandTotal += subtotal;

            const notesHtml = item.notes ? `<p class="cart-item-notes">Nota: ${item.notes}</p>` : '';

            const itemEl = document.createElement("div");
            itemEl.className = "cart-item";
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    ${notesHtml}
                    <div class="cart-item-price">${CONFIG.currency} ${subtotal.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button onclick="changeCartQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeCartQuantity(${index}, 1)">+</button>
                    <button class="btn-remove" onclick="removeFromCart(${index})">🗑</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    cartCountDisplay.innerText = totalItems;
    cartTotalDisplay.innerText = `${CONFIG.currency} ${grandTotal.toFixed(2)}`;
}

function changeCartQuantity(index, delta) {
    if (cart[index].quantity + delta >= 1) {
        cart[index].quantity += delta;
    } else {
        removeFromCart(index);
        return;
    }
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Abrir/Cerrar la barra lateral del carrito
function toggleCart() {
    const sidebar = document.getElementById("cartSidebar");
    const overlay = document.getElementById("cartOverlay");
    
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- GENERACIÓN DEL MENSAJE DE WHATSAPP ---
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de enviar tu pedido.");
        return;
    }

    let message = `${CONFIG.deliveryMsg}\n\n`;
    let grandTotal = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        grandTotal += subtotal;
        
        message += `- *${item.name}* x${item.quantity} (${CONFIG.currency} ${subtotal.toFixed(2)})\n`;
        if (item.notes) {
            message += `  *Nota:* _${item.notes}_\n`;
        }
    });

    message += `\n*Total aproximado: ${CONFIG.currency} ${grandTotal.toFixed(2)}*`;

    // Codificar para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.phone}?text=${encodedMessage}`;

    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Opcional: vaciar carrito después de enviar
    // cart = []; updateCartUI(); toggleCart();
}