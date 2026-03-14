// dashboard.js - VERSÃO FINAL COM ORDENAÇÃO E NOMES
console.log("DASHBOARD ATUALIZADO v2");

async function carregarResumo() {
    const tbody = document.querySelector('#tabelaResumo tbody');
    if (!tbody) return;
    tbody.innerHTML = "<tr><td colspan='5'>Carregando dados...</td></tr>";

    try {
        // Busca Vendas e Clientes ao mesmo tempo para cruzar os dados
        const [resVendas, resClientes] = await Promise.all([
            fetch('/api/Vendas'),
            fetch('/api/Clientes')
        ]);

        const vendasAPI = await resVendas.json();
        const clientesAPI = await resClientes.json();
        const orcamentosLocais = JSON.parse(localStorage.getItem('orcamentos') || "[]");

        // 1. Prepara as Vendas Reais
        const listaVendas = vendasAPI.map(v => {
            const cli = clientesAPI.find(c => c.id === v.clienteId);
            return {
                label: `[VENDA] #${v.id}`,
                cor: '#2ecc71', // Verde
                cliente: cli ? cli.nome : "Cliente não identificado",
                total: v.valorTotal,
                data: new Date(v.dataVenda), // Data da API
                btnExcluir: `excluirVenda(${v.id})`,
                btnVer: `verVenda(${v.id})`
            };
        });

        // 2. Prepara os Orçamentos do LocalStorage
        const listaOrcamentos = orcamentosLocais.map((o, index) => {
            return {
                label: `[ORÇAMENTO]`,
                cor: '#f39c12',
                cliente: o.cliente,
                total: parseFloat(o.total) || 0,
                data: new Date(o.data),
                btnExcluir: `excluirOrcamento(${index})`,
                btnVer: `verOrcamento(${index})`
            };
        });

        // 3. UNE E ORDENA: O segredo para o mais recente ficar no topo
        const tudoJunto = [...listaVendas, ...listaOrcamentos].sort((a, b) => b.data - a.data);

        // 4. Desenha a tabela limpa
        tbody.innerHTML = "";
        tudoJunto.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><span onclick="${item.btnVer}" style="color: ${item.cor}; font-weight: bold; background: #f0f0f0; padding: 2px 5px; border-radius: 4px; cursor:pointer; text-decoration: underline;">${item.label}</span></td>
                    <td><strong>${item.cliente.toUpperCase()}</strong></td>
                    <td>R$ ${item.total.toFixed(2)}</td>
                    <td>${item.data.toLocaleDateString('pt-BR')} ${item.data.getHours()}:${String(item.data.getMinutes()).padStart(2, '0')}</td>
                    <td><button onclick="${item.btnExcluir}" class="btn-excluir" style="background:#e74c3c; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Excluir</button></td>
                </tr>`;
        });

    } catch (err) {
        console.error("Erro ao carregar o dashboard:", err);
        tbody.innerHTML = "<tr><td colspan='5'>Erro ao carregar dados da API.</td></tr>";
    }
}

// Funções de exclusão permanecem...
async function excluirVenda(id) {
    if(!confirm("Excluir esta venda permanentemente?")) return;
    
    try {
        const res = await fetch(`/api/Vendas/${id}`, { method: 'DELETE' });
        console.log("Status:", res.status);
        
        if(res.ok) {
            location.reload();
        } else {
            const erro = await res.text();
            console.error("Erro ao excluir:", erro);
            alert("Erro: " + res.status + " - " + erro);
        }
    } catch(err) {
        console.error("Erro de conexão:", err);
        alert("Erro de conexão: " + err.message);
    }
}

function excluirOrcamento(index) {
    if(!confirm("Excluir este orçamento?")) return;
    let orcs = JSON.parse(localStorage.getItem('orcamentos') || "[]");
    orcs.splice(index, 1);
    localStorage.setItem('orcamentos', JSON.stringify(orcs));
    location.reload();
}

function verOrcamento(index) {
    const orcs = JSON.parse(localStorage.getItem('orcamentos') || "[]");
    const orc = orcs[index];
    localStorage.setItem('orcamento_em_edicao', JSON.stringify({
        index: index,
        cliente: orc.cliente,
        itens: orc.itens
    }));
    window.location.href = "pedido.html";
}

async function verVenda(id) {
    try {
        const [resVendas, resProdutos, resClientes] = await Promise.all([
            fetch('/api/Vendas'),
            fetch('/api/Produtos'),
            fetch('/api/Clientes')
        ]);
        const vendas = await resVendas.json();
        const produtos = await resProdutos.json();
        const clientes = await resClientes.json();

        // Agrupa todas as vendas do mesmo pedido pelo clienteId e data próxima
        const venda = vendas.find(v => v.id === id);
        if (!venda) return alert("Venda não encontrada!");

        const produto = produtos.find(p => p.id === venda.produtoId);
        const cliente = clientes.find(c => c.id === venda.clienteId);

        localStorage.setItem('venda_visualizar', JSON.stringify({
            id: venda.id,
            cliente: cliente ? cliente.nome : "Desconhecido",
            itens: [{
                produtoId: venda.produtoId,
                nome: produto ? produto.nome : "Produto #" + venda.produtoId,
                quantidade: venda.quantidadeVendida,
                preco: produto ? produto.precoVenda : 0
            }],
            total: venda.valorTotal
        }));

        window.location.href = "pedido.html";
    } catch(err) {
        console.error(err);
        alert("Erro ao carregar venda!");
    }
}

window.onload = carregarResumo;