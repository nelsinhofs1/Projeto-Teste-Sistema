// js/estoque.js
let todosOsProdutos = []; // Memória para o filtro

async function carregarEstoque() {
    const tbody = document.getElementById('listaEstoque');
    try {
        const res = await fetch('/api/Produtos');
        if (!res.ok) throw new Error("Falha ao buscar produtos");
        
        todosOsProdutos = await res.json();
        exibirProdutos(todosOsProdutos);
    } catch (error) {
        console.error("Erro:", error);
        if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Erro ao carregar dados da API.</td></tr>';
    }
}

function exibirProdutos(lista) {
    const tbody = document.getElementById('listaEstoque');
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(p => `
        <tr>
            <td><b>#${p.id}</b></td>
            <td>${p.nome.toUpperCase()}</td>
            <td>${p.quantidadeEstoque} unidades</td>
            <td>R$ ${p.precoVenda.toFixed(2)}</td>
            <td><span class="badge" style="background: #d4edda; color: #155724; padding: 5px 10px; border-radius: 20px; font-size: 11px;">✅ EM DIA</span></td>
            <td style="text-align: center;">
                <button class="btn-excluir" onclick="excluirProduto(${p.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Lógica da Barra de Pesquisa
document.getElementById('inputPesquisaProduto')?.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = todosOsProdutos.filter(p => 
        p.nome.toLowerCase().startsWith(termo)
    );
    exibirProdutos(filtrados);
});

async function excluirProduto(id) {
    if (confirm("⚠️ Tem certeza que deseja excluir este produto permanentemente?")) {
        try {
            const res = await fetch(`/api/Produtos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("✅ Produto removido!");
                carregarEstoque(); 
            } else {
                alert("❌ Erro ao excluir. Verifique se há vendas com este produto.");
            }
        } catch (error) {
            alert("❌ Erro de conexão.");
        }
    }
}

// Inicializa a carga ao abrir a página
document.addEventListener('DOMContentLoaded', carregarEstoque);