document.addEventListener('DOMContentLoaded', () => {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filterContainer = document.getElementById('filter-buttons');
    const searchInput = document.getElementById('search-input');
    const noResultsMsg = document.getElementById('no-results');

    // Estado global de la aplicación
    let allDemos = [];
    let currentCategory = 'todos';
    let currentSearchTerm = '';

    const loadDemos = async () => {
        try {
            const response = await fetch('demos.json');
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            allDemos = await response.json();
            
            // 1. Generar botones de filtro basados en las categorías únicas
            generateFilterButtons();
            
            // 2. Renderizar todas las tarjetas inicialmente
            renderDemos(allDemos);

        } catch (error) {
            console.error('Error al cargar demos:', error);
            portfolioGrid.innerHTML = `
                <div class="error-message" style="text-align: center; grid-column: 1/-1;">
                    <p>No se pudieron cargar las demostraciones. Verifica el servidor local.</p>
                </div>
            `;
        }
    };

    // --- LÓGICA DE FILTROS Y BÚSQUEDA ---

    const generateFilterButtons = () => {
        // Extraer categorías únicas usando Set
        const categoriasUnicas = [...new Set(allDemos.map(demo => demo.categoria))];
        
        // Crear el botón de "Todos" por defecto
        let buttonsHTML = `<button class="filter-btn active" data-filter="todos">Todos</button>`;
        
        // Crear un botón por cada categoría encontrada (Capitalizando la primera letra)
        categoriasUnicas.forEach(cat => {
            const label = cat.charAt(0).toUpperCase() + cat.slice(1);
            buttonsHTML += `<button class="filter-btn" data-filter="${cat}">${label}</button>`;
        });

        filterContainer.innerHTML = buttonsHTML;

        // Añadir Event Listeners a los botones recién creados
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Quitar clase activa de todos y ponerla al presionado
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Actualizar estado y aplicar filtros
                currentCategory = e.target.getAttribute('data-filter');
                applyFilters();
            });
        });
    };

    // Escuchar el input de texto para el buscador
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        applyFilters();
    });

    const applyFilters = () => {
        // Filtramos el array base original combinando categoría y texto
        const resultados = allDemos.filter(demo => {
            // Comprobar coincidencia de categoría
            const matchCategory = currentCategory === 'todos' || demo.categoria === currentCategory;
            
            // Comprobar coincidencia de texto 
            const matchSearch = demo.titulo.toLowerCase().includes(currentSearchTerm) 
            
            return matchCategory && matchSearch;
        });

        renderDemos(resultados);
    };

    // --- RENDERIZADO DEL DOM ---

    const renderDemos = (demosArray) => {
        portfolioGrid.innerHTML = ''; // Limpiar grilla

        if (demosArray.length === 0) {
            portfolioGrid.style.display = 'none';
            noResultsMsg.style.display = 'block';
            return;
        }

        portfolioGrid.style.display = 'grid';
        noResultsMsg.style.display = 'none';

        demosArray.forEach(demo => {
            const card = document.createElement('article');
            card.className = 'demo-card';
            // Añadimos la categoría como un pequeño badge/etiqueta visual
            const categoriaLabel = demo.categoria.charAt(0).toUpperCase() + demo.categoria.slice(1);

            card.innerHTML = `
                <div style="position: relative;">
                    <img src="${demo.imagen}" alt="${demo.titulo}" class="demo-image" loading="lazy">
                    <span style="position: absolute; top: 1rem; right: 1rem; background: var(--primary-color); color: #fff; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500;">
                        ${categoriaLabel}
                    </span>
                </div>
                <div class="demo-content">
                    <h3>${demo.titulo}</h3>
                   
                    <a href="${demo.enlace}" class="btn btn-primary demo-btn">Ver Plantilla</a>
                </div>
            `;

            portfolioGrid.appendChild(card);
        });
    };

    // Iniciar la carga
    loadDemos();
});