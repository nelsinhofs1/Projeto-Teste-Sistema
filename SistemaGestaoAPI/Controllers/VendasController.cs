using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaGestaoAPI.Data;
using SistemaGestaoAPI.Models;

namespace SistemaGestaoAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VendasController : ControllerBase
{
    private readonly AppDbContext _context;

    public VendasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Venda>>> GetVendas()
    {
        return await _context.Vendas.OrderByDescending(v => v.DataVenda).ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> RealizarVenda([FromBody] Venda venda)
    {
        try 
        {
            // Reset do ID para o banco não reclamar de tentativa de inserir ID manual
            venda.Id = 0;

            // 1. Validar se o Cliente existe (Evita erro de Chave Estrangeira)
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == venda.ClienteId);
            if (!clienteExiste) return BadRequest(new { mensagem = "Erro: Cliente ID " + venda.ClienteId + " não existe no banco!" });

            // 2. Busca o produto
            var produto = await _context.Produtos.FindAsync(venda.ProdutoId);
            if (produto == null) return NotFound(new { mensagem = "Erro: Produto ID " + venda.ProdutoId + " não encontrado!" });

            // 3. Validação de Estoque
            if (produto.QuantidadeEstoque < venda.QuantidadeVendida)
            {
                return BadRequest(new { mensagem = $"Estoque insuficiente para {produto.Nome}! Temos apenas {produto.QuantidadeEstoque}." });
            }

            // 4. Atualiza os dados
            produto.QuantidadeEstoque -= venda.QuantidadeVendida;
            venda.ValorTotal = produto.PrecoVenda * venda.QuantidadeVendida;
            venda.DataVenda = DateTime.Now;

            // 5. Salva no Banco
            _context.Vendas.Add(venda);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Venda processada com sucesso!" });
        }
        catch (Exception ex)
        {
            // Retorna o erro real para sabermos o que o SQL Server respondeu
            return BadRequest(new { mensagem = "Erro no Banco: " + ex.InnerException?.Message ?? ex.Message });
        }
    }
}