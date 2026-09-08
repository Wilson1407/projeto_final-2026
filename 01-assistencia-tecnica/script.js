// ═══════════════════════════════════════════════════════
// ZECATECH — LÓGICA DA PÁGINA
//
// ÍNDICE:
//  1. Dados (marcas, modelos, peças, visuais e filtros)
//  2. Elementos do DOM
//  3. Estado (itens do orçamento)
//  4. Utilitários (dinheiro, selects, normalização de texto)
//  5. Orçamento (selects em cascata + carrinho)
//  6. Catálogo (geração, filtros e renderização com hover)
//  7. Pagamento Pix (payload EMV + QR Code)
//  8. Ordem de Serviço
//  9. Extras (menu mobile, ano do rodapé)
// 10. Inicialização
// ════════════════════════════════════════════════════════

// ═══════════ 1. DADOS ══════════════════════════════════

// Marcas → modelos (lista enxuta, ~5 por marca).
// Adicionar/remover aqui atualiza o orçamento E o catálogo.
const BRANDS = {
    "Apple":    ["iPhone 15"],
    "Samsung":  ["Galaxy S24"],
    "Motorola": ["Edge 40"],
    "Xiaomi":   ["Redmi Note 13 Pro"],
    "POCO":     ["POCO X6"],
    "Realme":   ["Realme C55"],
    "ASUS":     ["Zenfone 10"],
    "Google":   ["Pixel 7a"],
    "OnePlus":  ["OnePlus 12"],
    "OPPO":     ["A78"],
    "Infinix":  ["Hot 30"],
    "Huawei":   ["P40"]
};

// Identidade visual de cada marca: [cor do aparelho, cor da
// tela, emoji da "capinha"]. Usada só na ilustração do catálogo.
const BRAND_VISUALS = {
    "Apple":    ["#3a3a3c", "#0a84ff", "🍎"],
    "Samsung":  ["#1c2a4a", "#5b8def", "📲"],
    "Motorola": ["#2b2b2b", "#00c2a8", "🦇"],
    "Xiaomi":   ["#16181c", "#ff6900", "⚡"],
    "POCO":     ["#f5c518", "#1a1a1a", "💀"],
    "Realme":   ["#ffd400", "#222222", "🌻"],
    "ASUS":     ["#0d0d0d", "#00ddff", "🎮"],
    "Google":   ["#e8eaed", "#1a73e8", "🔵"],
    "OnePlus":  ["#1f1f1f", "#eb0028", "🔴"],
    "OPPO":     ["#0f766e", "#7ff0dc", "💚"],
    "Infinix":  ["#101010", "#39e75f", "✨"],
    "Huawei":   ["#cf0a2c", "#ffd7de", "🌹"]
};
const DEFAULT_VISUAL = ["#26425c", "#6ee7ff", "📱"];

// Link de imagem para cada marca do catálogo.
// Substitua pelas fotos reais da sua loja quando tiver!
const BRAND_IMAGES = {
    "Apple":    "img/img01.jpeg",
    "Samsung":  "img/img02.jpeg",
    "Motorola": "img/img03.jpeg",
    "Xiaomi":   "img/img04.jpeg",
    "POCO":     "img/img05.jpeg",
    "Realme":   "img/img06.jpeg",
    "ASUS":     "img/img07.jpeg",
    "Google":   "img/img08.jpeg",
    "OnePlus":  "img/img09.jpeg",
    "OPPO":     "img/img10.jpeg",
    "Infinix":  "img/img11.jpeg",
    "Huawei":   "img/img12.jpeg"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";

// Peças/serviços base: [nome, preço base em R$].
const BASE_PARTS = [
    ["Tela", 280],
    ["Placa", 650],
    ["Conector de carga", 90],
    ["Bateria", 320],
    ["Câmera traseira", 180],
    ["Câmera frontal", 150],
    ["Alto-falante", 95],
    ["Microfone", 80],
    ["Carcaça / tampa traseira", 180],
    ["Flex / Botões", 75],
    ["Flex de carga", 95],
    ["Vidro da câmera", 60],
    ["Sensor / biometria", 120],
    ["Software / formatação", 80],
    ["Diagnóstico", 50],
    ["Limpeza interna", 70]
];

// Fator de preço por marca (multiplica o preço base)
const BRAND_FACTORS = {
    "Apple": 1.35,
    "Samsung": 1.18, "ASUS": 1.18, "Sony": 1.18, "OnePlus": 1.18,
    "Xiaomi": 1.00, "POCO": 1.00, "Motorola": 1.00, "Realme": 1.00
};
const DEFAULT_BRAND_FACTOR = 0.88; // Huawei, OPPO, Infinix, Google...

// Mapeia cada nome de peça para a categoria do filtro
// do catálogo. Precisa bater com os <option> do HTML.
const PART_CATEGORIES = [
    ["Tela",      "Tela"],
    ["Placa",     "Placa"],
    ["carga",     "Conector"],   // "Conector de carga" e "Flex de carga"
    ["Bateria",   "Bateria"],
    ["âmera",     "Câmera"],     // "Câmera..." e "Vidro da câmera"
    ["Alto",      "Áudio"],      // "Alto-falante"
    ["Micro",     "Áudio"],      // "Microfone"
    ["Carcaça",   "Carcaça"],
    ["Vidro",     "Carcaça"],    // "Vidro da câmera"
    ["Flex",      "Flex / Botões"],
    ["Sensor",    "Flex / Botões"],
    ["Software",  "Software"]
];
const DEFAULT_CATEGORY = "Serviço"; // Diagnóstico, Limpeza...




// ═══════════ 2. ELEMENTOS DO DOM ════════════════════════

// Guarda os elementos usados várias vezes (evita ficar
// chamando getElementById no meio do código)
const $ = id => document.getElementById(id);

const brand       = $("brand");
const model       = $("model");
const part        = $("part");
const quantity    = $("quantity");
const labor       = $("labor");
const quoteItems  = $("quoteItems");
const totalEl     = $("total");
const catalogGrid = $("catalogGrid");


// ═══════════ 3. ESTADO ═════════════════════════════════

// Array de itens adicionados ao orçamento.
// Cada item: { brand, model, name, unit, qty, labor }
let quote = [];


// ═══════════ 4. UTILITÁRIOS ════════════════════════════

// Formata número como dinheiro brasileiro: 1234.5 → "R$ 1.234,50"
function money(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Normaliza texto para a busca: remove acentos e deixa
// minúsculo ("camera" encontra "Câmera")
const norm = s => s.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Preenche um <select> com um array de opções.
// item[0] = texto exibido, item[1] = valor (opcional)
function fillSelect(select, placeholder, items) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item[1] ?? item[0];
        option.textContent = item[0];
        select.appendChild(option);
    });
}


// ═══════════ 5. ORÇAMENTO ══════════════════════════════

// Carrega as marcas no primeiro select ao abrir a página
fillSelect(brand, "Selecione a marca",
    Object.keys(BRANDS).map(b => [b])
);

// Ao escolher a marca: habilita o select de modelos
// e reseta a peça (a peça depende do modelo)
brand.addEventListener("change", () => {
    const models = BRANDS[brand.value] || [];
    fillSelect(model, "Selecione o modelo", models.map(m => [m]));
    fillSelect(part, "Primeiro escolha o modelo", []);
    model.disabled = !brand.value;
    part.disabled = true;
});

// Ao escolher o modelo: habilita o select de peças,
// mostrando nome e preço de cada opção
model.addEventListener("change", () => {
    fillSelect(part, "Selecione a peça ou serviço",
        BASE_PARTS.map(([name, value]) =>
            [`${name} — ${money(value)}`, value, name]
        )
    );
    // Guarda o nome da peça em dataset para usar no orçamento
    [...part.options].forEach((opt, i) => {
        if (i > 0) opt.dataset.name = BASE_PARTS[i - 1][0];
    });
    part.disabled = !model.value;
});

// Envio do formulário: valida, cria o item e adiciona ao carrinho
$("budgetForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!brand.value || !model.value || !part.value) return;

    // Limita a quantidade entre 1 e 20 (igual ao HTML)
    const qty = Math.max(1, Math.min(20, Number(quantity.value) || 1));

    quote.push({
        brand:  brand.value,
        model:  model.value,
        name:   part.options[part.selectedIndex].dataset.name,
        unit:   Number(part.value),
        qty:    qty,
        labor:  Number(labor.value)
    });

    renderQuote();
});

// Desenha todos os itens do carrinho e calcula o total.
// Também sincroniza o total exibido na seção do Pix.
function renderQuote() {
    quoteItems.innerHTML = "";

    if (!quote.length) {
        quoteItems.innerHTML =
            '<p class="empty">Nenhuma peça adicionada ainda.</p>';
    }

    let total = 0;

    quote.forEach((item, index) => {
        // Subtotal = preço unitário × qtd + mão de obra
        const subtotal = item.unit * item.qty + item.labor;
        total += subtotal;

        const div = document.createElement("div");
        div.className = "quote-item";
        div.innerHTML = `
            <div>
                <strong>${item.brand} ${item.model}</strong>
                <small>${item.name} × ${item.qty}</small>
                <small>Mão de obra: ${money(item.labor)}</small>
            </div>
            <div>
                <strong>${money(subtotal)}</strong>
                <br>
                <button class="remove" data-index="${index}">remover</button>
            </div>`;
        quoteItems.appendChild(div);
    });

    // Atualiza os totais (orçamento e atalho do Pix)
    totalEl.textContent = money(total);
    $("quoteTotal").textContent = money(total);
}

// Remove um item ao clicar em "remover" (delegação de eventos:
// um único listener cuida de todos os botões criados dinamicamente)
quoteItems.addEventListener("click", event => {
    if (event.target.classList.contains("remove")) {
        quote.splice(Number(event.target.dataset.index), 1);
        renderQuote();
    }
});

// Botão "Limpar": zera o orçamento
$("clearQuote").addEventListener("click", () => {
    quote = [];
    renderQuote();
});


// ═══════════ 6. CATÁLOGO ═══════════════════════════════

// Gera todas as combinações marca × modelo × peça.
// O preço final = preço base × fator da marca × fator do modelo,
// arredondado para múltiplos de 5.
function catalogData() {
    const rows = [];

    Object.entries(BRANDS).forEach(([brandName, models]) => {
        const brandFactor = BRAND_FACTORS[brandName] ?? DEFAULT_BRAND_FACTOR;

        models.forEach((modelName, modelIndex) => {
            BASE_PARTS.forEach(([partName, basePrice], partIndex) => {

                // Fator do modelo: varia levemente entre 0.9 e 1.14
                const modelFactor =
                    0.9 + ((modelName.length + modelIndex + partIndex) % 5) * 0.06;

                // Categoria da peça (para o filtro do catálogo)
                const match = PART_CATEGORIES.find(([word]) =>
                    partName.includes(word));
                const category = match ? match[1] : DEFAULT_CATEGORY;

                rows.push({
                    brand: brandName,
                    model: modelName,
                    category: category,
                    part: partName,
                    price: Math.round(basePrice * brandFactor * modelFactor / 5) * 5
                });
            });
        });
    });

    return rows;
}

const catalog = catalogData();

// Renderiza o catálogo: cada card mostra um MODELO (celular
// + preço "a partir de"), e a lista completa de serviços fica
// escondida, aparecendo ao passar o mouse (desktop) ou ao
// tocar no card (mobile/tablet). A busca considera marca,
// modelo E o nome de todas as peças disponíveis.
function renderCatalog() {
    const search = norm($("search").value).trim();
    const category = $("categoryFilter").value;

    // ── Agrupa os serviços por modelo (marca + modelo) ──
    const grouped = {};

    catalog.forEach(item => {
        const key = `${item.brand}|${item.model}`;
        if (!grouped[key]) {
            grouped[key] = {
                brand: item.brand,
                model: item.model,
                services: []
            };
        }
        grouped[key].services.push({
            part: item.part,
            category: item.category,
            price: item.price
        });
    });

    const filtered = Object.values(grouped)
        .filter(item => {
            // ✅ Busca inclui marca, modelo E nomes das peças
            // (normalizada: "camera" acha "Câmera")
            const text = norm(
                item.brand + " " + item.model + " " +
                item.services.map(s => s.part).join(" ")
            );

                        return (
                (!search || text.includes(search)) &&
                (!category ||
                 item.services.some(s => s.category === category))
            );
        })
        .slice(0, 180);

    catalogGrid.innerHTML = filtered.map(item => {
        // Cores/emoji da marca para a ilustração
        const [body, screen, emoji] =
            BRAND_VISUALS[item.brand] ?? DEFAULT_VISUAL;

        // Ordena os serviços do mais barato ao mais caro
        const sorted = item.services
            .sort((a, b) => a.price - b.price);
        const cheapest = sorted[0];

        // Lista HTML de todos os serviços (escondida por padrão)
        const servicesHtml = sorted.map(s => `
            <div class="service-item">
                <span class="service-name">${s.part}</span>
                <span class="service-price">${money(s.price)}</span>
            </div>`).join("");

        // Seta indicando que o card expande
        const arrowIcon = `
            <svg viewBox="0 0 24 24" width="16" height="16"
                 style="position:absolute;right:15px;top:15px;fill:#0879bd">
                <path d="M7 10l5 5 5-5z"/>
            </svg>`;

        // Ilustração vetorial: corpo escuro, tela colorida
        // e câmera dupla no topo. Escala via viewBox.
        const phoneSvg = `
            <svg viewBox="0 0 120 160" role="img"
                 aria-label="Ilustração ${item.brand}">
                <rect x="35" y="5"  width="50" height="110" rx="12"
                      fill="${body}"/>
                <rect x="40" y="14" width="50" height="92" rx="6"
                      fill="${screen}" opacity="0.9"/>
                <circle cx="50" cy="20" r="4" fill="#ffffff" opacity="0.5"/>
                <circle cx="63" cy="20" r="4" fill="#ffffff" opacity="0.6"/>
                <rect x="52" y="100" width="20" height="3" rx="1.5"
                      fill="#00000033"/>
                <text x="95" y="42" font-size="16">${emoji}</text>
            </svg>`;

        return `
        <article class="product" tabindex="0">
            ${arrowIcon}
                       <div class="product-img">
                <img src="${BRAND_IMAGES[item.brand] ?? DEFAULT_IMAGE}"
                     alt="${item.brand} ${item.model}"
                     loading="lazy"
                     onerror="this.outerHTML='<span class=img-fallback>${emoji}</span>'">
            </div>
            </div>
            <div class="category">${item.brand}</div>
            <h3>${item.model}</h3>
            <p class="base-part">Serviços a partir de</p>
            <div class="price">${money(cheapest.price)}</div>

            <!-- Lista oculta: expande no hover (desktop) ou clique (mobile) -->
            <div class="services-list">
                ${sorted.map(s => `
                    <div class="service-item">
                        <span class="service-name">${s.part}</span>
                        <span class="service-price">${money(s.price)}</span>
                    </div>`).join("")}
                <div class="service-item" style="border:none;padding-top:10px;font-style:italic;color:#a9b9ca;">
                    <span>* Consulte orçamento para valor exato</span>
                </div>
            </div>
        </article>`;
    }).join("");
}

// Busca e filtro disparam nova renderização a cada mudança
$("search").addEventListener("input", renderCatalog);
$("categoryFilter").addEventListener("change", renderCatalog);

// Expansão dos cards (mobile/tablet): toque alterna a lista
// de serviços; também abre com Enter para acessibilidade.
// Feito por delegação de eventos — cobre todos os cards.
catalogGrid.addEventListener("click", event => {
    const card = event.target.closest(".product");
    if (card) card.classList.toggle("expanded");
});
catalogGrid.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.classList.contains("product")) {
        event.target.classList.toggle("expanded");
    }
});


// ═══════════ 7. PAGAMENTO PIX ══════════════════════════

// Mostra mensagem de sucesso/erro abaixo do formulário do Pix.
// Usa as classes .pix-feedback do CSS e some após 4 segundos.
function pixFeedback(message, ok) {
    // Remove mensagem anterior, se existir
    $(".pix-config .pix-feedback")?.remove();

    const div = document.createElement("div");
    div.className = `pix-feedback ${ok ? "success" : "error"}`;
    div.textContent = message;
    document.querySelector(".pix-config form").appendChild(div);

    setTimeout(() => div.remove(), 4000);
}

// Calcula o CRC16-CCITT (checksum exigido no final do código Pix)
function crc16(text) {
    let crc = 0xFFFF;
    for (const byte of text) {
        crc ^= byte.charCodeAt(0) << 8;
        for (let i = 0; i < 8; i++) {
            crc = (crc & 0x8000)
                ? ((crc << 1) ^ 0x1021)
                : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Monta o payload Pix (padrão EMV do Banco Central).
// É o texto codificado no QR Code — contém chave, valor,
// beneficiário, cidade e o checksum de validação.
function buildPixPayload(key, name, city, amount) {
    // Sanitiza: sem acentos, maiúsculas, sem espaços extras
    const clean = s => s.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

    const field = (id, value) =>
        id + String(value.length).padStart(2, "0") + value;

    // Bloco 26: informações da conta (GUI + chave Pix)
    const merchantAccount =
        field("00", "br.gov.bcb.pix") + field("01", key);

    let payload =
        field("00", "01") +                     // versão do formato
        field("26", merchantAccount) +          // conta Pix
        field("52", "0000") +                   // categoria do comerciante
        field("53", "986") +                    // moeda: real (BRL)
        field("54", amount.toFixed(2)) +        // valor em reais
        field("58", "BR") +                     // país
        field("59", clean(name).slice(0, 25)) + // nome do beneficiário (máx. 25)
        field("60", clean(city).slice(0, 15)) + // cidade (máx. 15)
        field("62", field("05", "ZECATECH"));   // identificador

    // Checksum final: "6304" + CRC16 do payload montado
    payload += "6304" + crc16(payload);

    return payload;
}

// Gera (ou regenera) o QR Code na tela.
// Importante: limpa o container antes, porque a biblioteca
// QRCode.js acumula imagens se chamada sem limpar.
function generateQR(payload) {
    const container = $("qrcode");
    container.innerHTML = "";
    new QRCode(container, {
        text: payload,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Recupera o total atual do orçamento como número
function getTotal() {
    return quote.reduce(
        (sum, item) => sum + item.unit * item.qty + item.labor,
        0
    );
}

// Envio do formulário do Pix: lê os dados, monta o payload
// e gera o QR Code + atualiza valor e chave exibidos
$("pixForm").addEventListener("submit", event => {
    event.preventDefault();

    // Valor: usa o customizado ou o total do orçamento
    const custom = Number($("pixCustomValue").value);
    const amount = custom > 0 ? custom : getTotal();

    if (amount <= 0) {
        pixFeedback("Defina um valor antes de gerar o QR Code.", false);
        return;
    }

    const key  = $("pixKeyInput").value.trim();
    const name = $("pixNameInput").value.trim();
    const city = $("pixCityInput").value.trim();

    // Atualiza a exibição e gera o QR
    $("pixValor").textContent = money(amount);
    $("pixChave").textContent = key;
    generateQR(buildPixPayload(key, name, city, amount));

    pixFeedback("QR Code gerado com sucesso!", true);
});

// Botão "Usar Total": copia o total do orçamento
// para o campo de valor customizado
$("useQuoteValue").addEventListener("click", () => {
    $("pixCustomValue").value = getTotal().toFixed(2);
});

// Botão "Baixar": salva a imagem do QR Code como PNG
$("downloadQR").addEventListener("click", () => {
    // A biblioteca gera um <img> ou <canvas> dentro do container
    const qrImage = $("qrcode").querySelector("img");
    const qrCanvas = $("qrcode").querySelector("canvas");

    if (!qrImage && !qrCanvas) {
        pixFeedback("Gere um QR Code antes de baixar.", false);
        return;
    }

    const link = document.createElement("a");
    // Se houver <img>, usa o src (data URL); senão converte o canvas
    link.href = qrImage
        ? qrImage.src
        : qrCanvas.toDataURL("image/png");
    link.download = "qrcode-pix-zecatech.png";
    link.click();
});





// ═══════════ 8. ORDEM DE SERVIÇO ═══════════════════════

// Envio do formulário da OS: gera um número (baseado no
// timestamp), mostra o feedback e monta o cartão resumo
$("osForm").addEventListener("submit", event => {
    event.preventDefault();

    // Número único: últimos 6 dígitos do timestamp atual
    const number = "OS-" + Date.now().toString().slice(-6);

    const client = $("client").value;
    const device = $("osDevice").value;
    const status = $("osStatus").value;

    $("osFeedback").textContent = `Ordem ${number} criada com sucesso!`;

    const card = $("orderCard");
    card.classList.remove("hidden");
    card.innerHTML = `
        <h3>📋 ${number}</h3>
        <p><strong>Cliente:</strong> ${client}</p>
        <p><strong>Aparelho:</strong> ${device}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>`;
});

// Botão "Gerar ordem de serviço" (no painel do orçamento):
// apenas rola a página até o formulário da OS
$("generateOrder").addEventListener("click", () => {
    $("ordem").scrollIntoView({ behavior: "smooth" });
});


// ═══════════ 9. EXTRAS ═════════════════════════════════

// Menu hambúrguer (mobile): abre/fecha a lista de links
$("menuToggle").addEventListener("click", () => {
    const menu = $("menu");
    const open = menu.classList.toggle("open");
    $("menuToggle").setAttribute("aria-expanded", open);
});

// Fecha o menu ao clicar em um link (melhor experiência no celular)
$("menu").addEventListener("click", event => {
    if (event.target.tagName === "A") {
        $("menu").classList.remove("open");
    }
});

// Ano automático no rodapé
$("year").textContent = new Date().getFullYear();

// ═══════════ 10. CHATBOX — ATENDIMENTO AUTOMÁTICO ═════

// Base de conhecimento do bot. Cada entrada tem um array de
// palavras-chave e a resposta. Quanto mais palavras casarem,
// mais provável a resposta ser escolhida (sistema de pontuação).
const CHAT_ANSWERS = [
    // ── Cumprimentos e interações simples ──
    {
        keys: ["bom dia", "boa tarde", "boa noite", "oi", "olá", "ola", "eae", "opa"],
        answer: "Olá! 👋 Como posso ajudar? Você pode perguntar sobre horários, preços, prazo ou digitar o problema do seu aparelho."
    },
    {
        keys: ["tudo bem", "como vai", "como esta", "tudo bom"],
        answer: "Tudo ótimo, obrigado por perguntar! 😄 E você? Em que posso ajudar com seu celular?"
    },
    {
        keys: ["obrigado", "obrigada", "vlw", "valeu", "brigado"],
        answer: "Por nada! 🤝 Se precisar de mais alguma coisa, é só chamar."
    },
    {
        keys: ["tchau", "adeus", "ate mais", "até mais", "falou"],
        answer: "Até logo! 👋 Qualquer dúvida, estamos por aqui."
    },
    {
        keys: ["sim", "claro", "posso", "ok", "beleza"],
        answer: "Que ótimo! 😊 Use os botões abaixo ou me diga: qual é o problema com o seu aparelho?"
    },

    // ── Perguntas frequentes ──
    {
        keys: ["horario", "horário", "aberto", "fechado", "funciona", "hora"],
        answer: "Funcionamos de segunda a sexta, das 9h às 18h, e sábados das 9h às 13h. 🕐"
    },
    {
        keys: ["preco", "preço", "valor", "custa", "barato", "caro", "quanto"],
        answer: "Depende do aparelho e da peça! Monte seu orçamento na calculadora da página ou veja o catálogo — todos os preços estão lá. 😉"
    },
    {
        keys: ["pagamento", "pagar", "pix", "cartao", "cartão", "dinheiro", "parcel"],
        answer: "Aceitamos Pix (com desconto!), dinheiro e cartão em até 12x. Para pagar por Pix, use nossa seção de pagamento aqui na página! 💳"
    },
    {
        keys: ["local", "onde", "endereco", "endereço", "fica", "ficamos", "loja"],
        answer: "Estamos na Rua Exemplo, 123 — Centro. Também buscamos e entregamos em toda a região! 📍"
    },
    {
        keys: ["prazo", "demora", "tempo", "dias", "quando fica pronto", "rapid"],
        answer: "Trocas de tela e bateria saem no mesmo dia. Reparos de placa levam de 2 a 5 dias úteis. ⏱️"
    },
    {
        keys: ["garantia", "garantido", "warranty"],
        answer: "Todos os serviços têm 90 dias de garantia e as peças, 6 meses. 🛡️"
    },
    {
        keys: ["whatsapp", "zap", "telefone", "ligar", "contato", "falar com alguem"],
        answer: "Você pode falar com a gente no WhatsApp: (11) 98765-4321 — respondemos rapidinho! 📲"
    },
    {
        keys: ["tela", "vidro", "trincou", "quebrou", "rachou"],
        answer: "Tela trincada é nosso serviço mais comum! 📱 O valor depende do modelo — monte o orçamento na página ou busque seu aparelho no catálogo."
    },
    {
        keys: ["bateria", "descarregando", "durar", "dura pouco", "esquentando"],
        answer: "Bateria com problema trocamos no mesmo dia, com 6 meses de garantia. 🔋 Consulte o valor no catálogo!"
    },
    {
        keys: ["agua", "água", "molhou", "caiu na piscina", "afogou"],
        answer: "Caiu na água? ⚠️ Não ligue o aparelho! Traga o quanto antes para uma limpeza interna — isso evita oxidação da placa."
    },
    {
        keys: ["nao liga", "não liga", "morreu", "apagou", "preto"],
        answer: "Aparelho que não liga pode ser bateria, conector de carga ou placa. Fazemos um diagnóstico completo antes de qualquer serviço. 🔍"
    },
    {
        keys: ["carregador", "carregando", "nao carrega", "não carrega", "conector", "entrada"],
        answer: "Problema de carga geralmente é o conector ou o flex de carga — consertamos no mesmo dia! 🔌"
    },
    {
        keys: ["camera", "câmera", "foto", "lente"],
        answer: "Consertamos câmera traseira, frontal e vidro da câmera. 📸 Confira os valores no catálogo!"
    },
    {
        keys: ["lento", "travando", "espaco", "espaço", "memoria", "memória", "formatar"],
        answer: "Se o aparelho está lento ou travando, nossa limpeza de software/formatação resolve na hora! 💾"
    },
    {
        keys: ["som", "audio", "áudio", "alto falante", "microfone", "ouvir"],
        answer: "Problemas de som (alto-falante ou microfone) resolvemos rápido — consulte os valores no catálogo! 🔊"
    },
    {
        keys: ["orcamento", "orçamento", "calcular", "calculo", "calculadora"],
        answer: "É fácil: role até a seção 'Orçamento', escolha marca, modelo e peça — o total aparece na hora! 🧮"
    },
    {
        keys: ["peca", "peça", "original", "replica", "réplica", "qualidade"],
        answer: "Trabalhamos com peças originais e de alta compatibilidade, sempre com garantia. 🧩"
    },
    {
        keys: ["retirada", "buscar", "entrega", "delivery", "levar"],
        answer: "Sim! Buscamos e entregamos o aparelho na sua casa sem custo extra na região. 🚚"
    }
];

// Resposta quando nada combina — já sugere o que fazer
const CHAT_FALLBACK =
    "Hmm, não tenho certeza se entendi. 😅 Tente uma das opções abaixo, ou descreva o problema (ex: 'tela quebrou', 'não carrega'). Para falar com alguém: WhatsApp (00) 90000-0000";

// ── Motor de respostas ────────────────────────────────

// Adiciona um balão de mensagem na área do chat
function chatAddMessage(text, who) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    $("chatMessages").appendChild(div);
    $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

// Compara a pergunta do usuário com TODAS as respostas,
// contando quantas palavras-chave cada uma acerta, e
// devolve a de maior pontuação (empate: primeira da lista).
function chatReply(question) {
    const q = norm(question);

    let best = null;
    let bestScore = 0;

    CHAT_ANSWERS.forEach(item => {
        // Pontos = nº de palavras-chave encontradas na pergunta
        const score = item.keys.reduce(
            (score, k) => score + (q.includes(norm(k)) ? 1 : 0),
            0
        );
        if (score > bestScore) {
            best = item;
            bestScore = score;
        }
    });

    // Pequeno atraso para parecer que está "digitando"
    setTimeout(() => {
        chatAddMessage(best ? best.answer : CHAT_FALLBACK, "bot");
    }, 500);
}

// Processa pergunta recebida (botão rápido ou texto livre)
function chatAsk(question) {
    chatAddMessage(question, "user");
    chatReply(question);
}

// Abrir/fechar a janela do chat
$("chatToggle").addEventListener("click", () => {
    const box = $("chatBox");
    const opening = box.classList.contains("hidden");
    box.classList.toggle("hidden");

    // Mensagem de boas-vindas na primeira abertura
    if (opening && !$("chatMessages").children.length) {
        chatAddMessage("Olá! 👋 Sou o assistente da ZecaTech. Como posso ajudar?", "bot");
    }
});

$("chatClose").addEventListener("click", () => {
    $("chatBox").classList.add("hidden");
});

// Botões de perguntas rápidas (delegação de eventos)
document.querySelector(".chat-quick").addEventListener("click", event => {
    if (event.target.dataset.question) {
        chatAsk(event.target.textContent.replace(/^[^\w]+\s*/, ""));
    }
});

// Mensagem digitada pelo usuário
$("chatForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("chatInput");
    if (input.value.trim()) {
        chatAsk(input.value.trim());
        input.value = "";
    }
});


// ═══════════ 11. INICIALIZAÇÃO ═════════════════════════

renderCatalog();
renderQuote();