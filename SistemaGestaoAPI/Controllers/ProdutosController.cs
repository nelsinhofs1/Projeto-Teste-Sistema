using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaGestaoAPI.Data;
using SistemaGestaoAPI.Models;

namespace SistemaGestaoAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Produtos (Listar todos)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
    {
        return await _context.Produtos.ToListAsync();
    }

    // POST: api/Produtos (Cadastrar novo)
    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProdutos), new { id = produto.Id }, produto);
    }
    // DELETE: api/Produtos/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduto(int id)
    {
    var produto = await _context.Produtos.FindAsync(id);
    if (produto == null) return NotFound();

    _context.Produtos.Remove(produto);
    await _context.SaveChangesAsync();

    return NoContent();
    }
}