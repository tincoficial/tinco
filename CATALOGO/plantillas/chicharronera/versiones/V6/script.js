// --- CONFIGURACIÓN PRINCIPAL ---
const CONFIG = {
    phone: "50581878263",
    currency: "C$"
};

/* 
================================
VARIABLES GLOBALES
================================ 
*/
let productsData = [];
let currentCategory = "Todos";
let activeProductModal = null;
let dataLoaded = false;
/* 
================================
INICIALIZACIÓN
================================ 
*/
async function initApp() {
    try {
        const response = await fetch('./products.json');
        if (!response.ok) throw new Error("No se pudo conectar con el archivo de productos");
        
        productsData = await response.json();
        
        renderCategories();
        renderProducts();

        dataLoaded = true;

        window.dispatchEvent(new Event('productsLoaded'));

    } catch (error) {
        console.error("Error al cargar la aplicación:", error);
        document.getElementById("productsContainer").innerHTML = 
            `<p style="text-align:center; color:red;">Error al cargar el menú. Por favor intenta más tarde.</p>`;
    }
}

/* 
================================
EVENTOS PRINCIPALES
================================ 
*/
document.addEventListener("DOMContentLoaded", () => {
     initApp();
    
    // --- LÓGICA NUEVA: Detección de producto por URL ---
    const params = new URLSearchParams(window.location.search);
    const nombreProducto = params.get('producto');

    window.addEventListener('productsLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const nombreProducto = params.get('producto');
        if (nombreProducto) {
            buscarYAbrirProducto(nombreProducto);
        }
    });
    
    if (nombreProducto) {
        buscarYAbrirProducto(nombreProducto);
    }
    // ----------------------------------------------------

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
});;

/* 
================================
RENDERIZADO DE INTERFAZ
================================ 
*/
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

/* 
================================
RENDERIZADO DE PRODUCTOS
================================ 
*/
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
        let badgeHtml = p.badge ? `<span class="badge ${p.badge.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">${p.badge}</span>` : '';
        
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
                <button class="btn-open" onclick="event.stopPropagation(); openModal(${p.id})">Ver detalles</button>
            </div>
        `;
        container.appendChild(card);
    });
}
/* 
================================
LOGICA DEL MODAL DE DETALLE
================================ 
*/
function openModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    activeProductModal = product;

    // Asignación de datos básicos
    document.getElementById("modalImage").src = product.image;
    document.getElementById("modalTitle").innerText = product.name;
    document.getElementById("modalPrice").innerText = `${CONFIG.currency} ${product.price.toFixed(2)}`;

    // Configuración del enlace de WhatsApp
    const whatsappLink = document.getElementById("whatsappLink");
    const mensaje = `Hola, quiero saber más información acerca de:\n\n*${product.name}*\n*${CONFIG.currency}${product.price.toFixed(2)}*`;
    whatsappLink.href = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(mensaje)}`;

    // Limpieza de contenedores antes de renderizar
    const specsContainer = document.getElementById("modalSpecs");
    const descContainer = document.getElementById("modalDescription");
    specsContainer.innerHTML = "";
    descContainer.innerHTML = ""; 

    // Renderizado de descripción y especificaciones
    if (Array.isArray(product.description)) {
        product.description.forEach(item => {
            if (typeof item === 'string') {
                // Crear un nuevo elemento P para cada string de descripción
                const p = document.createElement("p");
                p.className = "modal-desc";
                
                // Convertir *negritas* en <strong> y aplicar formato
                p.innerHTML = item.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
                descContainer.appendChild(p);
            } else if (typeof item === 'object') {
                // Renderizar tabla de especificaciones
                const div = document.createElement("div");
                div.className = "spec-item";
                div.innerHTML = `<strong>${item.label}:</strong> <span>${item.value}</span>`;
                specsContainer.appendChild(div);
            }
        });
    } else {
        // Fallback si la descripción no es un array
        descContainer.innerText = product.description;
    }

    document.getElementById("productModal").classList.add("active");
}

/* 
================================
CERRAR EL MODAL
================================ 
*/
function closeModal() {
    document.getElementById("productModal").classList.remove("active");
    activeProductModal = null;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* 
================================
COPIAR ENLACE AL PORTAPAPELES
================================ 
*/
function copyToClipboard(btn) {
    // Si pasamos el botón directamente como parámetro, evitamos errores de event.target
    const originalText = btn.innerText;
    const url = window.location.href;

    navigator.clipboard.writeText(url).then(() => {
        // Guardamos el color original antes de cambiarlo
        const originalBg = btn.style.backgroundColor;
        
        btn.innerText = "¡Copiado!";
        btn.style.backgroundColor = "var(--primary-color)";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = originalBg; // Restauramos al color original
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
        btn.innerText = "Error";
    });
}

/* 
================================
COMPARITR ENLACE DEL CATALOGO (MODIFICAR)
================================ 
*/
async function compartirCatalogo(btn) {
    // Definimos tu URL fija
    const url = "https://sabor-clandestino.netlify.app/";
    
    const data = {
        title: 'Sabor Clandestino',
        text: '¡Mira nuestro catálogo de hamburguesas y pizzas!',
        url: url
    };

    try {
        if (navigator.share) {
            // Intenta usar la función nativa de compartir del celular
            await navigator.share(data);
        } else {
            // Fallback: Si no es compatible, copia el enlace al portapapeles
            await navigator.clipboard.writeText(url);
            alert('¡Enlace copiado al portapapeles!');
        }
    } catch (err) {
        console.error('Error al compartir:', err);
    }
}

/* 
================================
COMPARITR ENLACE DEL PRODUCTO
================================ 
*/
async function compartirProducto(btn) {
    // Obtenemos el nombre del producto directamente del modal
    const nombre = document.getElementById('modalTitle').innerText;
    
    // Creamos la URL con el parámetro del producto
    // Nota: Reemplaza 'tusitioweb.com' por tu dominio real cuando lo subas
    const urlCompartible = `${window.location.origin}${window.location.pathname}?producto=${encodeURIComponent(nombre)}`;
    
    const data = {
        title: 'Sabor Clandestino',
        text: `¡Tienes que probar la ${nombre}!`,
        url: urlCompartible
    };

    if (navigator.share) {
        try {
            await navigator.share(data);
        } catch (err) {
            console.log("Error al compartir:", err);
        }
    } else {
        // Fallback: copiar al portapapeles si no hay API de compartir
        navigator.clipboard.writeText(urlCompartible);
        alert("Enlace del producto copiado al portapapeles");
    }
}

/* 
================================
BUSCAR Y ABRIR PRODUCTO DESDE LA URL
================================ 
*/
function buscarYAbrirProducto(nombreDeLaUrl) {
    const nombreDecodificado = decodeURIComponent(nombreDeLaUrl);
    
    // Usamos productsData (tu variable real) y p.name (tu propiedad real)
    const productoEncontrado = productsData.find(p => 
        p.name.trim().toLowerCase() === nombreDecodificado.trim().toLowerCase()
    );
    
    if (productoEncontrado) {
        // Usamos openModal(producto.id) porque tu función espera un ID
        openModal(productoEncontrado.id); 
    }
}