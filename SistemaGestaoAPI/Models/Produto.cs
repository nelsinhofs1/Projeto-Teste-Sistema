namespace SistemaGestaoAPI.Models
{
    public class Produto
    {
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Lote { get; set; } = string.Empty;
    public DateTime Validade { get; set; }
    public int QuantidadeEstoque { get; set; }
    public decimal PrecoCusto { get; set; }
    public decimal PercentualImposto { get; set; }
    public decimal MargemLucro { get; set; }

    // Cálculos automáticos
    public decimal ValorImpostos => PrecoCusto * (PercentualImposto / 100);
    public decimal PrecoVenda => PrecoCusto + ValorImpostos + (PrecoCusto * (MargemLucro / 100));
    }
}