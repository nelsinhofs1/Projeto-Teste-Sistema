let todasVendas = [];
let todosClientes = [];
let todosProdutos = [];

async function carregarDados() {
    try {
        const [resVendas, resClientes, resProdutos] = await Promise.all([
            fetch('/api/Vendas'),
            fetch('/api/Clientes'),
            fetch('/api/Produtos')
        ]);
        todasVendas = await resVendas.json();
        todosClientes = await resClientes.json();
        todosProdutos = await resProdutos.json();
        renderizar(todasVendas);
    } catch(err) {
        console.error("Erro ao carregar:", err);
    }
}

function renderizar(vendas) {
    const tbody = document.getElementById('tabelaRelatorio');

    if (vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma venda encontrada.</td></tr>';
        document.getElementById('totalVendas').innerText = 'R$ 0.00';
        document.getElementById('numeroPedidos').innerText = '0';
        document.getElementById('ticketMedio').innerText = 'R$ 0.00';
        return;
    }

    const total = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    document.getElementById('totalVendas').innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById('numeroPedidos').innerText = vendas.length;
    document.getElementById('ticketMedio').innerText = `R$ ${(total / vendas.length).toFixed(2)}`;

    tbody.innerHTML = vendas.map(v => {
        const cliente = todosClientes.find(c => c.id === v.clienteId);
        const produto = todosProdutos.find(p => p.id === v.produtoId);
        const data = new Date(v.dataVenda);
        return `<tr>
            <td><b>#${v.id}</b></td>
            <td>${cliente ? cliente.nome.toUpperCase() : '---'}</td>
            <td>${produto ? produto.nome : '---'}</td>
            <td>${v.quantidadeVendida}</td>
            <td>R$ ${v.valorTotal.toFixed(2)}</td>
            <td>${data.toLocaleDateString('pt-BR')} ${data.getHours()}:${String(data.getMinutes()).padStart(2,'0')}</td>
        </tr>`;
    }).join('');
}

function filtrar() {
    const ini = document.getElementById('dataInicial').value;
    const fim = document.getElementById('dataFinal').value;

    if (!ini || !fim) return alert("Selecione as duas datas!");

    const dataIni = new Date(ini);
    const dataFim = new Date(fim);
    dataFim.setHours(23, 59, 59);

    const filtradas = todasVendas.filter(v => {
        const data = new Date(v.dataVenda);
        return data >= dataIni && data <= dataFim;
    });

    renderizar(filtradas);
}

function limparFiltro() {
    document.getElementById('dataInicial').value = '';
    document.getElementById('dataFinal').value = '';
    renderizar(todasVendas);
}

window.onload = carregarDados;