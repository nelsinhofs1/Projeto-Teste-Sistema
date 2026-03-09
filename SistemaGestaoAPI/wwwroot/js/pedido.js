// pedido.js
let carrinho = [];
let produtosAPI = [];
let clientesAPI = [];

async function carregarDados() {
    try {
        const [resProd, resCli] = await Promise.all([
            fetch('/api/Produtos'),
            fetch('/api/Clientes')
        ]);
        produtosAPI = await resProd.json();
        clientesAPI = await resCli.json();
        console.log("Produtos carregados:", produtosAPI);
        console.log("Clientes carregados:", clientesAPI);
        verificarRascunho();
    } catch (err) { console.error("Erro ao carregar dados da API:", err); }
}

function verificarRascunho() {
    const rascunho = localStorage.getItem('orcamento_em_edicao');
    if (rascunho) {
        const dados = JSON.parse(rascunho);
        document.getElementById('buscaCliente').value = dados.cliente || "";
        if (dados.itens) {
            carrinho = dados.itens.map(item => ({
                produtoId: item.produtoId || item.id,
                nome: item.nome,
                quantidade: parseInt(item.quantidade || item.qtd || 1),
                preco: parseFloat(item.preco || item.precoUnitario || 0)
            }));
            renderizarTabela();
        }
        localStorage.removeItem('orcamento_em_edicao');
    }
}

window.adicionarAoCarrinho = function() {
    const nomeInput = document.getElementById('buscaNome').value;
    const qtdInput = parseInt(document.getElementById('qtdItem').value) || 1;
    const prod = produtosAPI.find(p => p.nome.trim() === nomeInput.trim());

    if (prod) {
        carrinho.push({ 
            produtoId: prod.id, 
            nome: prod.nome, 
            quantidade: qtdInput, 
            preco: prod.precoVenda 
        });
        renderizarTabela();
        document.getElementById('buscaNome').value = "";
    } else { alert("Produto não encontrado na lista!"); }
}

function renderizarTabela() {
    const tbody = document.querySelector('#tabelaItens tbody');
    let totalGeral = 0;
    tbody.innerHTML = carrinho.map((item, index) => {
        const subtotal = item.quantidade * item.preco;
        totalGeral += subtotal;
        return `<tr>
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>R$ ${subtotal.toFixed(2)}</td>
            <td><button onclick="removerItem(${index})" style="background:#ff4757; color:white; border:none; padding: 2px 8px; cursor:pointer;">X</button></td>
        </tr>`;
    }).join('');
    document.getElementById('valorTotal').innerText = totalGeral.toFixed(2);
}

window.finalizarOperacao = async function() {
    const tipo = document.getElementById('tipoOperacao').value;
    const nomeCliente = document.getElementById('buscaCliente').value;

    if (carrinho.length === 0) return alert("Adicione itens ao carrinho!");
    if (!nomeCliente) return alert("Informe o cliente!");

    if (tipo === "pedido") {
        // Busca o cliente pelo nome para pegar o ID correto
        const clienteObj = clientesAPI.find(c => c.nome.toLowerCase().trim() === nomeCliente.toLowerCase().trim());
        
        if (!clienteObj) {
            return alert("Cliente não encontrado! Cadastre o cliente primeiro ou verifique o nome.");
        }

        const idCliente = clienteObj.id;

        try {
            for (const item of carrinho) {
                const payload = {
                    clienteId: idCliente,
                    produtoId: parseInt(item.produtoId),
                    quantidadeVendida: parseInt(item.quantidade)
                };

                console.log("Enviando item:", payload);

                const res = await fetch('/api/Vendas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const erroMsg = await res.json();
                    throw new Error(erroMsg.mensagem || "Erro ao salvar no banco");
                }
            }
            alert("Venda realizada com sucesso!");
            window.location.href = "dashboard.html";
        } catch (err) { 
            console.error(err);
            alert("Erro na API: " + err.message); 
        }
    } else {
        // Lógica de Orçamento
        let orcamentos = JSON.parse(localStorage.getItem('orcamentos') || "[]");
        orcamentos.push({ 
            cliente: nomeCliente, 
            total: document.getElementById('valorTotal').innerText, 
            data: new Date().toLocaleDateString(), 
            itens: carrinho 
        });
        localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
        alert("Orçamento Salvo localmente!");
        window.location.href = "dashboard.html";
    }
}

window.removerItem = function(index) {
    carrinho.splice(index, 1);
    renderizarTabela();
}

window.onload = carregarDados;