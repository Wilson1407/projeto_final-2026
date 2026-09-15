/* MOSTRAR PRODUTOS */

function mostrarProdutos(categoria) {

    const lista =
        document.getElementById("listaProdutos");

    let produtos = "";


    /* CREATINAS */

    if (categoria === "creatina") {

        produtos = `

            <div class="produto-item">

                <div class="produto-imagem">
                    🥤
                </div>

                <h3>
                    Creatina Arnold 300g
                </h3>

                <p>
                    Creatina em pote de 300g.
                </p>

                <div class="preco-produto">
                    R$ 89,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Creatina Arnold 300g')">

                    Comprar

                </button>

            </div>


            <div class="produto-item">

                <div class="produto-imagem">
                    🥤
                </div>

                <h3>
                    Creatina Premium 300g
                </h3>

                <p>
                    Opção premium disponível na loja.
                </p>

                <div class="preco-produto">
                    R$ 109,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Creatina Premium 300g')">

                    Comprar

                </button>

            </div>


            <div class="produto-item">

                <div class="produto-imagem">
                    🥤
                </div>

                <h3>
                    Creatina Monohidratada 250g
                </h3>

                <p>
                    Pote de creatina monohidratada.
                </p>

                <div class="preco-produto">
                    R$ 79,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Creatina Monohidratada 250g')">

                    Comprar

                </button>

            </div>

        `;

    }


    /* WHEY */

    else if (categoria === "whey") {

        produtos = `

            <div class="produto-item">

                <div class="produto-imagem">
                    🥛
                </div>

                <h3>
                    Whey Protein Arnold 900g
                </h3>

                <p>
                    Whey Protein em embalagem de 900g.
                </p>

                <div class="preco-produto">
                    R$ 119,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Whey Protein Arnold 900g')">

                    Comprar

                </button>

            </div>


            <div class="produto-item">

                <div class="produto-imagem">
                    🥛
                </div>

                <h3>
                    Whey Premium 900g
                </h3>

                <p>
                    Whey Protein da linha premium.
                </p>

                <div class="preco-produto">
                    R$ 149,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Whey Premium 900g')">

                    Comprar

                </button>

            </div>


            <div class="produto-item">

                <div class="produto-imagem">
                    🥛
                </div>

                <h3>
                    Whey Chocolate 900g
                </h3>

                <p>
                    Whey Protein sabor chocolate.
                </p>

                <div class="preco-produto">
                    R$ 129,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Whey Chocolate 900g')">

                    Comprar

                </button>

            </div>

        `;

    }


    /* OUTROS PRODUTOS */

    else if (categoria === "outros") {

        produtos = `

            <div class="produto-item">

                <div class="produto-imagem">
                    🍫
                </div>

                <h3>
                    Barra de Proteína
                </h3>

                <p>
                    Barra de proteína.
                </p>

                <div class="preco-produto">
                    R$ 9,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Barra de Proteína')">

                    Comprar

                </button>

            </div>


            <div class="produto-item">

                <div class="produto-imagem">
                    🥤
                </div>

                <h3>
                    Shaker Academia Arnold
                </h3>

                <p>
                    Shaker personalizado da academia.
                </p>

                <div class="preco-produto">
                    R$ 29,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Shaker Academia Arnold')">

                    Comprar

                </button>

            </div>


            <div class="produto-item">

                <div class="produto-imagem">
                    🎒
                </div>

                <h3>
                    Bolsa Academia Arnold
                </h3>

                <p>
                    Bolsa personalizada da academia.
                </p>

                <div class="preco-produto">
                    R$ 79,90
                </div>

                <button
                    class="botao"
                    onclick="comprarProduto('Bolsa Academia Arnold')">

                    Comprar

                </button>

            </div>

        `;

    }


    lista.innerHTML = `

        <h2>
            Produtos disponíveis
        </h2>

        <div class="lista-produtos-grid">

            ${produtos}

        </div>

    `;


    lista.style.display = "block";


    lista.scrollIntoView({
        behavior: "smooth"
    });

}


/* BOTÃO COMPRAR */

function comprarProduto(nomeProduto) {

    alert(
        "Produto selecionado: " +
        nomeProduto +
        "\n\nEntre em contato com a Academia Arnold para finalizar a compra."
    );

}


/* FORMULÁRIO */

const formulario =
    document.getElementById("formulario");


formulario.addEventListener(
    "submit",

    function(event) {

        event.preventDefault();


        const nome =
            document.getElementById("nome").value;


        alert(
            "Obrigado, " +
            nome +
            "! Sua mensagem foi enviada com sucesso."
        );


        formulario.reset();

    }
);