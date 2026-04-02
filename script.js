// 1. CARROSSEL PRINCIPAL (TOPO)
let slideIndex = 1;
const slides = document.querySelectorAll('.carousel-item');

function showSlides(n) {
    if (slides.length === 0) return;
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    slides.forEach(s => s.style.display = "none");
    slides[slideIndex - 1].style.display = "flex";
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

if(slides.length > 0) {
    showSlides(slideIndex);
    setInterval(() => changeSlide(1), 5000);
}

// 2. MOVIMENTO DOS SLIDERS DE CATEGORIA (SETAS)
function scrollSlider(button, direction) {
    const track = button.parentElement.querySelector('.slider-track');
    const scrollAmount = track.clientWidth * 0.8; // Rola 80% da tela visível
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// 3. TEMA E PESQUISA (OPCIONAL)
const themeToggle = document.getElementById('themeToggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    });
}

const grid = document.getElementById('grid-filmes');

let pagina = 0;
const filmesPorPagina = 20;

// EXEMPLO DE DADOS (troque depois por API ou JSON)
function gerarFilmes(qtd) {
    const filmes = [];
    for (let i = 0; i < qtd; i++) {
        filmes.push({
            titulo: 'Filme ' + (pagina * filmesPorPagina + i + 1),
            imagem: 'https://via.placeholder.com/300x450'
        });
    }
    return filmes;
}

function carregarFilmes() {
    // Adicionei uma verificação rápida para não quebrar se o grid não existir
    if (!grid) return; 
    
    const filmes = gerarFilmes(filmesPorPagina);

    filmes.forEach(filme => {
        const div = document.createElement('div');
        div.className = 'filme';
        div.innerHTML = `
            <img src="${filme.imagem}">
            <h4>${filme.titulo}</h4>
        `;
        grid.appendChild(div);
    });

    pagina++;
}

// SCROLL INFINITO
window.addEventListener('scroll', () => {
    const fimDaPagina =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

    if (fimDaPagina) {
        carregarFilmes();
    }
});

// PRIMEIRA CARGA
carregarFilmes();

// ==========================================
// PESQUISA EM TEMPO REAL (TELA SEPARADA)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput');
    const telaPesquisa = document.getElementById('tela-pesquisa');
    const resultadosGrid = document.getElementById('resultados-grid');
    const mensagemVazia = document.getElementById('mensagem-vazia');

    // Elementos da página principal que serão escondidos durante a busca
    const carrosselPrincipal = document.querySelector('.carousel-container');
    const conteudoPrincipal = document.querySelector('.content');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            
            // Pega todos os cards originais da página para usar como base de dados
            const todosOsCards = document.querySelectorAll('.content .card');

            if (termo.length > 0) {
                // 1. Esconde a Home e mostra a Tela de Pesquisa
                if (carrosselPrincipal) carrosselPrincipal.classList.add('hidden');
                if (conteudoPrincipal) conteudoPrincipal.classList.add('hidden');
                telaPesquisa.classList.remove('hidden');

                // 2. Limpa os resultados da digitação anterior
                resultadosGrid.innerHTML = '';
                let encontrouAlgo = false;

                // 3. Procura os termos nos títulos e descrições
                todosOsCards.forEach(card => {
                    const titulo = card.querySelector('h4').innerText.toLowerCase();
                    const info = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : '';

                    if (titulo.includes(termo) || info.includes(termo)) {
                        // Clona o card para exibi-lo na grade de resultados
                        const cardClonado = card.cloneNode(true);
                        cardClonado.classList.remove('hidden-search'); // Garante que o clone fique visível
                        resultadosGrid.appendChild(cardClonado);
                        encontrouAlgo = true;
                    }
                });

                // 4. Lida com a mensagem de "Nenhum resultado"
                if (!encontrouAlgo) {
                    mensagemVazia.classList.remove('hidden');
                } else {
                    mensagemVazia.classList.add('hidden');
                }

            } else {
                // CAMPO VAZIO: Esconde a tela de pesquisa e volta para a Home original
                telaPesquisa.classList.add('hidden');
                if (carrosselPrincipal) carrosselPrincipal.classList.remove('hidden');
                if (conteudoPrincipal) conteudoPrincipal.classList.remove('hidden');
            }
        });
    }
});
// ==========================================
// SISTEMA DE ORDEM ALEATÓRIA (TRUE/FALSE)
// ==========================================
function randomizarCategorias() {
    const sliders = document.querySelectorAll('.category-slider');
    
    sliders.forEach(slider => {
        // Verifica se a categoria está marcada com true para embaralhar
        const isRandom = slider.getAttribute('data-random') === 'true';
        
        if (isRandom) {
            const track = slider.querySelector('.slider-track');
            const cards = Array.from(track.querySelectorAll('.card'));
            
            // Algoritmo Fisher-Yates para embaralhar os cards perfeitamente
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }
            
            // Reinsere os cards na nova ordem
            cards.forEach(card => track.appendChild(card));
        }
    });
}

// ==========================================
// FUNDO DINÂMICO (BLUR BASEADO NO PÔSTER)
// ==========================================
function iniciarFundoDinamico() {
    const bgElement = document.getElementById('bg-dinamico');
    const imagens = document.querySelectorAll('.card img');
    
    if (!bgElement || imagens.length === 0) return;

    // Define a primeira imagem como fundo inicial
    bgElement.style.backgroundImage = `url('${imagens[0].src}')`;

    // Cria um 'observador' que vigia qual imagem está no centro da tela
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Se a imagem cruzou o meio da tela
            if (entry.isIntersecting) {
                const imgSrc = entry.target.src;
                bgElement.style.backgroundImage = `url('${imgSrc}')`;
            }
        });
    }, {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Gatilho apenas no meio vertical da tela
        threshold: 0.1
    });

    // Coloca o observador para vigiar todas as imagens dos cards
    imagens.forEach(img => observer.observe(img));
}

// Inicializa as duas funções assim que o DOM carregar (pode colocar junto do DOMContentLoaded da pesquisa)
document.addEventListener("DOMContentLoaded", () => {
    randomizarCategorias();
    iniciarFundoDinamico();
});
