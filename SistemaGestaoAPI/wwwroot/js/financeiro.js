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

        const totalNoCaixa = dadosCaixa.valorInicial + totalVendasDia - (dadosCaixa.retiradas || 0);

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
                ${(dadosCaixa.historicoRetiradas || []).map(r => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Retirada (${r.tipo}):</span>
                        <span style="color: #e74c3c; font-weight: bold;">- R$ ${r.valor.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px;">
                    <span>TOTAL EM CAIXA:</span> 
                    <span>R$ ${totalNoCaixa.toFixed(2)}</span>
                </div>
            </div>

            <div id="painelRetirada" style="display:none; background:#fff3cd; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #ffc107;">
                <p style="font-weight:bold; margin:0 0 10px;">Nova Retirada</p>
                <input type="number" id="valorRetirada" placeholder="R$ 0,00" step="0.01" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd; box-sizing:border-box; margin-bottom:10px;">
                <div style="display:flex; gap:10px;">
                    <button onclick="confirmarRetirada('saque')" style="flex:1; padding:10px; background:#e67e22; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">💵 Saque</button>
                    <button onclick="confirmarRetirada('despesa')" style="flex:1; padding:10px; background:#8e44ad; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">🧾 Despesa</button>
                    <button onclick="document.getElementById('painelRetirada').style.display='none'" style="flex:1; padding:10px; background:#95a5a6; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Cancelar</button>
                </div>
            </div>

            <button onclick="document.getElementById('painelRetirada').style.display='block'" style="width:100%; padding:12px; background:#e67e22; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-bottom:10px;">💵 RETIRADA</button>
            <button class="btn-perigo" style="width: 100%; padding: 15px;" onclick="fecharCaixa('${totalNoCaixa.toFixed(2)}')">FECHAR CAIXA E ZERAR</button>
        `;
    }
}
function confirmarRetirada(tipo) {
    const valor = parseFloat(document.getElementById('valorRetirada').value) || 0;
    if (valor <= 0) return alert("Digite um valor válido!");

    const label = tipo === 'saque' ? 'Saque' : 'Despesa';
    if (confirm(`Confirmar ${label} de R$ ${valor.toFixed(2)}?`)) {
        if (!dadosCaixa.historicoRetiradas) dadosCaixa.historicoRetiradas = [];
        dadosCaixa.historicoRetiradas.push({ tipo: label, valor: valor });
        dadosCaixa.retiradas = (dadosCaixa.retiradas || 0) + valor;
        localStorage.setItem('controleCaixa', JSON.stringify(dadosCaixa));
        alert(`${label} de R$ ${valor.toFixed(2)} registrada!`);
        carregarTela();
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