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
                btnExcluir: `excluirVenda(${v.id})`
            };
        });

        // 2. Prepara os Orçamentos do LocalStorage
        const listaOrcamentos = orcamentosLocais.map((o, index) => {
            // Converte string de data "DD/MM/AAAA" para objeto Date
            const partes = o.data.split('/');
            const dataObj = partes.length === 3 ? new Date(partes[2], partes[1] - 1, partes[0]) : new Date();
            
            return {
                label: `[ORÇAMENTO]`,
                cor: '#f39c12', // Laranja
                cliente: o.cliente,
                total: parseFloat(o.total) || 0,
                data: dataObj,
                btnExcluir: `excluirOrcamento(${index})`
            };
        });

        // 3. UNE E ORDENA: O segredo para o mais recente ficar no topo
        const tudoJunto = [...listaVendas, ...listaOrcamentos].sort((a, b) => b.data - a.data);

        // 4. Desenha a tabela limpa
        tbody.innerHTML = "";
        tudoJunto.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><span style="color: ${item.cor}; font-weight: bold; background: #f0f0f0; padding: 2px 5px; border-radius: 4px;">${item.label}</span></td>
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
    await fetch(`/api/Vendas/${id}`, { method: 'DELETE' });
    location.reload();
}

function excluirOrcamento(index) {
    if(!confirm("Excluir este orçamento?")) return;
    let orcs = JSON.parse(localStorage.getItem('orcamentos') || "[]");
    orcs.splice(index, 1);
    localStorage.setItem('orcamentos', JSON.stringify(orcs));
    location.reload();
}

window.onload = carregarResumo;