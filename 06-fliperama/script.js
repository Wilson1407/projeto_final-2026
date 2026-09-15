/* =======================================
   1. DADOS: LISTA DE JOGOS (GAMES)
   ======================================= */
const games = [
    // 1. O PONG (Mantém link para 'pong.html' se existir, ou usa a Wikipedia)
    {
      title: "Clássico Pong",
      author: "Atari / Game Library", 
      category: "pong",
      year: "1972",
      cover: "./img/pong.png", 
      link: "./pong/index.html", // Link interno mantido para 'pong.html'
      wikipedia_link: "https://pt.wikipedia.org/wiki/Pong", // Adicionado link da Wikipedia como fallback/info
      description: "Tênis virtual dois jogadores ou contra CPU"
    },

    // 2. SNAKE
    {
      title: "Snake",
      author: "Nokia / Game Library", 
      category: "snake",
      year: "1976",
      cover: "./img/snake.png", 
      link: "/06-fliperama/snake/index.html", // Link interno mantido para 'snake.html'
      wikipedia_link: "https://pt.wikipedia.org/wiki/snake", // Adicionado link da Wikipedia como fallback/info
      description: "Cobra cresce ao comer, evite bater em si mesma"
    },

    // 2. SPACE INVADERS
    {
      title: "Space Invaders",
      author: "Taito", 
      category: "space-invadors",
      year: "1978",
      cover: "./img/space-invaders.png", 
      link: "/06-fliperama/space-invaders/index.html", // Link interno mantido para 'space-invaders.html'
      wikipedia_link: "https://pt.wikipedia.org/wiki/space-invaders", // Adicionado link da Wikipedia como fallback/info
      description: "Defesa contra invasores alienígenas em formação"
    },
    
];
/* =======================================
   2. DOM & VARIÁVEIS DE ESTADO
   ======================================= */
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryList = document.getElementById('categoryList');
const sortSelect = document.getElementById('sortSelect');
const resultCount = document.getElementById('resultCount');
const themeSwitchBtn = document.getElementById('theme-switch-btn');
const themeIcon = document.getElementById('theme-icon');

let currentFilter = 'todos';
let currentSearchTerm = '';
let currentSort = 'title';

/* =======================================
   3. RENDERIZAÇÃO E FILTRAGEM
   ======================================= */

function createGameCard(game) {
    const coverUrl = game.cover || 'https://via.placeholder.com/200x250?text=Sem+Capa';
    
    // Determina qual link usar (prioriza interno, fallback para Wikipedia)
    const finalLink = game.link && game.link !== '#' ? game.link : game.wikipedia_link || '#';
    const isExternal = finalLink.startsWith('http');

    const descriptionText = game.description || 'Jogo clássico retrô';
    const yearText = game.year ? ` • ${game.year}` : '';

    return `
        <a href="${finalLink}" class="book" ${isExternal ? 'target="_blank"' : ''}>
            <div class="cover">
                <img src="${coverUrl}" alt="Capa do jogo ${game.title}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/200x250?text=Sem+Capa';"/>
            </div>
            <div class="meta">
                <h4>${game.title}</h4>
                <p>Por: ${game.author}${yearText}</p>
                <p style="font-size:12px;color:var(--text-muted)">${descriptionText}</p>
                <div class="tags">
                    <span class="tag">${game.category.replace(/-/g, ' ').toUpperCase()}</span>
                </div>
            </div>
        </a>
    `;
}

function updateGrid() {
    let filtered = games.filter(game => {
        const categoryMatch = currentFilter === 'todos' || game.category.toLowerCase() === currentFilter.toLowerCase();
        const searchMatch = game.title.toLowerCase().includes(currentSearchTerm) ||
                            game.author.toLowerCase().includes(currentSearchTerm) ||
                            game.category.toLowerCase().includes(currentSearchTerm);

        return categoryMatch && searchMatch;
    });

    // Ordenação
    filtered.sort((a, b) => {
        const valA = a[currentSort].toLowerCase();
        const valB = b[currentSort].toLowerCase();

        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
    });

    // Renderização
    if (booksGrid) {
        booksGrid.innerHTML = filtered.map(createGameCard).join('');
    }

    // Atualiza contagem
    if (resultCount) {
        resultCount.textContent = `Exibindo ${filtered.length} jogo${filtered.length !== 1 ? 's' : ''}`;
    }
}

/* =======================================
   4. LISTENERS DE EVENTOS
   ======================================= */

// A. Busca e Filtro de Texto
if (searchBtn && searchInput) {
    const handleSearch = () => {
        currentSearchTerm = searchInput.value.toLowerCase().trim();
        updateGrid();
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
}

// B. Filtro de Categoria (Chips)
if (categoryList) {
    categoryList.addEventListener('click', (event) => {
        if (event.target.classList.contains('chip')) {
            document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
            
            event.target.classList.add('active');
            currentFilter = event.target.dataset.cat;
            
            if (searchInput) {
                searchInput.value = '';
            }
            currentSearchTerm = '';

            updateGrid();
        }
    });
}

// C. Ordenação
if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
        currentSort = event.target.value;
        updateGrid();
    });
}

/* =======================================
   5. CONTROLE DE TEMA (DARK/LIGHT MODE)
   ======================================= */

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.textContent = 'light_mode';
            themeIcon.setAttribute('aria-label', 'Trocar para tema claro');
        } else {
            themeIcon.textContent = 'dark_mode';
            themeIcon.setAttribute('aria-label', 'Trocar para tema escuro');
        }
    }
}

function loadTheme() {
    let savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            saveTheme('dark');
        } else {
            saveTheme('light');
        }
    }
}

if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        saveTheme(newTheme);
    });
}

// Adicional: Detectar mudança automática do sistema
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        if (!localStorage.getItem('theme')) {
            saveTheme(event.matches ? 'dark' : 'light');
        }
    });
}

/* =======================================
   6. INICIALIZAÇÃO
   ======================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Define o ano do rodapé
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // 2. Carrega o tema
    loadTheme();
    
    // 3. Carrega os cards de jogos
    updateGrid();
});