async function salvarCliente() {
    const nome = document.getElementById('nomeCliente').value;
    const endereco = document.getElementById('enderecoCliente').value;
    const telefone = document.getElementById('telefoneCliente').value;

    if(!nome || !endereco) {
        alert("Por favor, preencha o nome e o endereço!");
        return;
    }

    const cliente = {
        nome: nome,
        endereco: endereco,
        telefone: telefone
    };

    try {
        const response = await fetch('/api/Clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });

        if (response.ok) {
            alert("✅ Cliente cadastrado com sucesso!");
            window.location.href = "clientes.html"; 
        } else {
            alert("❌ Erro ao cadastrar cliente.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("❌ Erro de conexão com o servidor.");
    }
}