async function realizarVenda() {
    const prodId = document.getElementById('produtoId').value;
    const qtd = document.getElementById('quantidade').value;

    if (!prodId || qtd <= 0) {
        alert("Preencha o ID e a quantidade corretamente!");
        return;
    }

    const payload = {
        produtoId: parseInt(prodId),
        quantidadeVendida: parseInt(qtd)
    };

    const msgEl = document.getElementById('mensagem');
    msgEl.innerText = "Processando...";
    msgEl.style.color = "#34495e";

    try {
        const response = await fetch('/api/Vendas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            msgEl.style.color = "green";
            msgEl.innerText = `✅ Venda Sucesso! Total: R$ ${result.total.toFixed(2)}`;
            
            document.getElementById('produtoId').value = "";
            document.getElementById('quantidade').value = "1";
        } else {
            msgEl.style.color = "red";
            msgEl.innerText = "❌ Erro: Verifique estoque ou ID do produto.";
        }
    } catch (error) {
        msgEl.style.color = "red";
        msgEl.innerText = "❌ Erro de conexão com o servidor.";
    }
}