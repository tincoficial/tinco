// --- CONFIGURACIÓN PRINCIPAL ---
const CONFIG = {
    phone: "50581878263",
    currency: "C$"
};

// --- BASE DE DATOS LOCAL (Simulada) ---
let productsData = [];
let currentCategory = "Todos";
let activeProductModal = null;

// --- INICIALIZACIÓN ---
async function initApp() {
    try {
        const response = await fetch('./products.json');
        if (!response.ok) throw new Error("No se pudo conectar con el archivo de productos");
        
        productsData = await response.json();
        
        renderCategories();
        renderProducts();
    } catch (error) {
        console.error("Error al cargar la aplicación:", error);
        document.getElementById("productsContainer").innerHTML = 
            `<p style="text-align:center; color:red;">Error al cargar el menú. Por favor intenta más tarde.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    
    document.getElementById("searchInput").addEventListener("input", (e) => {
        renderProducts(e.target.value);
    });

    window.addEventListener("scroll", () => {
        const btn = document.getElementById("backToTopBtn");
        if (btn) {
            if (window.scrollY > 300) btn.classList.add("visible");
            else btn.classList.remove("visible");
        }
    });
});

// --- RENDERIZADO DE INTERFAZ ---

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

function renderProducts(searchQuery = "") {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    const filteredProducts = productsData.filter(p => {
        const matchCategory = currentCategory === "Todos" || p.category === currentCategory;
        const descText = Array.isArray(p.description) 
    ? p.description.map(d => d.value).join(" ") 
    : p.description;

    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        descText.toLowerCase().includes(searchQuery.toLowerCase());
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
        card.onclick = () => openModal(p.id);
        
        card.innerHTML = `
            ${badgeHtml}
            <div class="img-container">
                <img src="${p.image}" alt="${p.name}" class="product-img">
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price">${CONFIG.currency} ${p.price.toFixed(2)}</div>
                <button class="btn-add-card" onclick="event.stopPropagation(); openModal(${p.id})">Ver detalles</button>
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

    document.getElementById("modalImage").src = product.image;
    document.getElementById("modalTitle").innerText = product.name;
    document.getElementById("modalPrice").innerText = `${CONFIG.currency} ${product.price.toFixed(2)}`;

    const specsContainer = document.getElementById("modalSpecs");
    const descText = document.getElementById("modalDescription");
    specsContainer.innerHTML = "";
    descText.innerText = "";

    if (Array.isArray(product.description)) {
        product.description.forEach(item => {
            // Si es un string, lo ponemos como párrafo
            if (typeof item === 'string') {
                const p = document.createElement("p");
                p.innerText = item;
                p.style.marginBottom = "15px";
                specsContainer.appendChild(p);
            } 
            // Si es el objeto de especificación
            else if (typeof item === 'object') {
                const div = document.createElement("div");
                div.className = "spec-item";
                div.innerHTML = `<strong>${item.label}:</strong> <span>${item.value}</span>`;
                specsContainer.appendChild(div);
            }
        });
    } else {
        descText.innerText = product.description;
    }

    // ... resto de tu lógica de WhatsApp ...
    document.getElementById("productModal").classList.add("active");
}

function closeModal() {
    document.getElementById("productModal").classList.remove("active");
    activeProductModal = null;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}