namespace SistemaGestaoAPI.Models;

public class Venda
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public int ClienteId { get; set; }
    public int QuantidadeVendida { get; set; }
    public DateTime DataVenda { get; set; }
    public decimal ValorTotal { get; set; }
    public virtual Cliente? Cliente { get; set; }
}