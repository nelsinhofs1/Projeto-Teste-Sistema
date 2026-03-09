let dadosCaixa = JSON.parse(localStorage.getItem('controleCaixa')) || { aberto: false, valorInicial: 0 };

async function carregarTela() {
    const container = document.getElementById('caixaContainer');
    if (!container) return;

    if (!dadosCaixa.aberto) {
        // TELA DE ABERTURA - Usando btn-sucesso para ficar verde
        container.innerHTML = `
            <div class="status-caixa status-fechado">STATUS: CAIXA FECHADO</div>
            <h3>Abertura de Turno</h3>
            <p style="color: #666; font-size: 14px;">Quanto dinheiro há na gaveta para troco?</p>
            <div class="form-group">
                <input type="number" id="valorInput" placeholder="R$ 0,00" step="0.01" style="font-size: 20px; text-align: center;">
            </div>
            <button class="btn-sucesso" style="width: 100%;" onclick="abrirCaixa()">ABRIR CAIXA AGORA</button>
        `;
    } else {
        // TELA DE CAIXA ABERTO
        let totalVendasDia = 0;
        try {
            const res = await fetch('/api/Vendas'); 
            if (res.ok) {
                const vendas = await res.json();
                const hoje = new Date().toLocaleDateString('pt-BR');
                
                totalVendasDia = vendas
                    .filter(v => new Date(v.dataVenda).toLocaleDateString('pt-BR') === hoje)
                    .reduce((acc, v) => acc + v.valorTotal, 0);
            }
        } catch (e) {
            console.warn("Erro ao buscar vendas da API:", e);
        }

        const totalNoCaixa = dadosCaixa.valorInicial + totalVendasDia;

        container.innerHTML = `
            <div class="status-caixa status-aberto">STATUS: CAIXA EM OPERAÇÃO</div>
            <h3>Fluxo de Hoje</h3>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; border: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Dinheiro Inicial:</span> 
                    <span>R$ ${dadosCaixa.valorInicial.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Vendas (Hoje):</span> 
                    <span style="color: #27ae60; font-weight: bold;">+ R$ ${totalVendasDia.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px;">
                    <span>TOTAL EM CAIXA:</span> 
                    <span>R$ ${totalNoCaixa.toFixed(2)}</span>
                </div>
            </div>
            <button class="btn-perigo" style="width: 100%; padding: 15px;" onclick="fecharCaixa('${totalNoCaixa.toFixed(2)}')">FECHAR CAIXA E ZERAR</button>
        `;
    }
}

function abrirCaixa() {
    const input = document.getElementById('valorInput');
    const valor = parseFloat(input.value) || 0;
    dadosCaixa = { aberto: true, valorInicial: valor };
    localStorage.setItem('controleCaixa', JSON.stringify(dadosCaixa));
    carregarTela();
}

function fecharCaixa(total) {
    if (confirm(`Atenção!\n\nConfirma o fechamento com R$ ${total} em mãos?\nO saldo será zerado para o próximo turno.`)) {
        localStorage.removeItem('controleCaixa');
        dadosCaixa = { aberto: false, valorInicial: 0 };
        alert("Caixa fechado com sucesso!");
        carregarTela();
    }
}

// Inicia a tela ao carregar
window.onload = carregarTela;