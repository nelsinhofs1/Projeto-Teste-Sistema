using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaGestaoAPI.Data;
using SistemaGestaoAPI.Models;

namespace SistemaGestaoAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsuariosController(AppDbContext context) => _context = context;

    // Cadastrar novo usuário
    [HttpPost("registrar")]
    public async Task<ActionResult<Usuario>> Registrar(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return Ok("Usuário criado com sucesso!");
    }

    // Rota de Login (Simples para estudo)
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginDTO dados)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dados.Email && u.Senha == dados.Senha);

        if (usuario == null) return Unauthorized("E-mail ou senha incorretos.");

        return Ok(new { Mensagem = $"Bem-vindo, {usuario.Nome}!", Cargo = usuario.Cargo });
    }
}

// Objeto auxiliar para o login
public class LoginDTO {
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}