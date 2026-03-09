async function enviarParaApi() {
    const nome = document.getElementById('nome').value;
    
    // Validação simples
    if(!nome) {
        alert("Por favor, digite o nome do produto.");
        return;
    }

    const produto = {
        nome: nome,
        lote: "LOTE-" + Math.floor(Math.random() * 9000),
        validade: "2030-12-31T00:00:00",
        quantidadeEstoque: parseInt(document.getElementById('estoque').value) || 0,
        precoCusto: parseFloat(document.getElementById('custo').value) || 0,
        percentualImposto: parseFloat(document.getElementById('imposto').value) || 0,
        margemLucro: parseFloat(document.getElementById('margem').value) || 0
    };

    try {
        const response = await fetch('/api/Produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (response.ok) {
            alert("✅ Produto cadastrado com sucesso!");
            window.location.href = "estoque.html"; 
        } else {
            alert("❌ Erro ao cadastrar. Verifique se o servidor está rodando.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro de conexão com a API.");
    }
}