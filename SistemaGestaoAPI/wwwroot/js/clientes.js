let todosOsClientes = []; // Variável global para guardar a lista vinda do banco

async function carregarClientes() {
    try {
        const res = await fetch('/api/Clientes');
        todosOsClientes = await res.json();
        exibirClientes(todosOsClientes); // Exibe todos ao carregar
    } catch (err) {
        console.error("Erro ao buscar clientes:", err);
    }
}

// Função responsável por desenhar a tabela na tela
function exibirClientes(lista) {
    const tbody = document.getElementById('tabelaClientes');
    if (!tbody) return;

    tbody.innerHTML = "";

    lista.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td><b>${c.nome.toUpperCase()}</b></td>
            <td>${c.endereco || '---'}</td>
            <td>${c.telefone || '---'}</td>
            <td>
                <button onclick="excluirCliente(${c.id})" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Lógica de Filtro (O Coração da Pesquisa)
document.getElementById('inputPesquisa')?.addEventListener('input', (e) => {
    const termoBusca = e.target.value.toLowerCase(); // O que você digitou (ex: "pe")
    
    // Filtra a lista original
    const filtrados = todosOsClientes.filter(cliente => 
        cliente.nome.toLowerCase().startsWith(termoBusca)
    );

    exibirClientes(filtrados); // Redesenha a tabela só com os que sobraram
});

async function excluirCliente(id) {
    if (confirm("Deseja apagar este cliente?")) {
        await fetch(`/api/Clientes/${id}`, { method: 'DELETE' });
        carregarClientes(); // Recarrega a lista do banco
    }
}

window.onload = carregarClientes;