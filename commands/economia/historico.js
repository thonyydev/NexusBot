const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("historico")
    .setDescription("Mostra seu histórico de transações")
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de transação para mostrar")
        .setRequired(false)
        .addChoices(
          { name: "💰 Todas as transações", value: "todas" },
          { name: "📤 Transferências enviadas", value: "enviadas" },
          { name: "📥 Transferências recebidas", value: "recebidas" },
          { name: "💼 Investimentos", value: "investimentos" },
          { name: "🏦 Empréstimos", value: "emprestimos" },
          { name: "🛒 Compras", value: "compras" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("pagina")
        .setDescription("Página do histórico (padrão: 1)")
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const tipo = interaction.options.getString("tipo") || "todas";
      const pagina = interaction.options.getInteger("pagina") || 1;
      const itensPorPagina = 5;

      const userData = await getUser(userId, guildId);

      // Coleta todas as transações
      let todasTransacoes = [];

      // Adiciona transferências
      if (userData.transferencias) {
        userData.transferencias.forEach(transf => {
          if (transf.de === userId) {
            todasTransacoes.push({
              tipo: "enviada",
              data: transf.data,
              descricao: `Transferência para ${transf.para}`,
              valor: -transf.quantia,
              taxa: transf.taxa,
              motivo: transf.motivo,
              categoria: "transferencia"
            });
          } else if (transf.para === userId) {
            todasTransacoes.push({
              tipo: "recebida",
              data: transf.data,
              descricao: `Transferência de ${transf.de}`,
              valor: transf.valorRecebido,
              taxa: 0,
              motivo: transf.motivo,
              categoria: "transferencia"
            });
          }
        });
      }

      // Adiciona investimentos
      if (userData.investimentos) {
        userData.investimentos.forEach(inv => {
          if (inv.ativo === false && inv.coletadoEm) {
            todasTransacoes.push({
              tipo: "investimento",
              data: inv.coletadoEm,
              descricao: `Retorno de investimento em ${inv.tipo}`,
              valor: inv.retorno,
              taxa: 0,
              motivo: "Retorno de investimento",
              categoria: "investimento"
            });
          }
        });
      }

      // Adiciona empréstimos
      if (userData.emprestimos) {
        userData.emprestimos.forEach(emp => {
          if (emp.ativo) {
            todasTransacoes.push({
              tipo: "emprestimo",
              data: emp.dataEmprestimo,
              descricao: "Empréstimo solicitado",
              valor: emp.quantia,
              taxa: 0,
              motivo: `Empréstimo de ${emp.prazo} dias`,
              categoria: "emprestimo"
            });
          }
          if (emp.pago) {
            todasTransacoes.push({
              tipo: "pagamento",
              data: emp.dataPagamento,
              descricao: "Empréstimo pago",
              valor: -emp.valorTotal,
              taxa: 0,
              motivo: "Pagamento de empréstimo",
              categoria: "emprestimo"
            });
          }
        });
      }

      // Adiciona compras da loja
      if (userData.inventario) {
        userData.inventario.forEach(item => {
          todasTransacoes.push({
            tipo: "compra",
            data: item.compradoEm,
            descricao: `Compra: ${item.nome}`,
            valor: 0, // Será calculado baseado no item
            taxa: 0,
            motivo: "Compra na loja",
            categoria: "compra"
          });
        });
      }

      // Filtra por tipo se especificado
      if (tipo !== "todas") {
        if (tipo === "enviadas") {
          todasTransacoes = todasTransacoes.filter(t => t.tipo === "enviada");
        } else if (tipo === "recebidas") {
          todasTransacoes = todasTransacoes.filter(t => t.tipo === "recebida");
        } else if (tipo === "investimentos") {
          todasTransacoes = todasTransacoes.filter(t => t.categoria === "investimento");
        } else if (tipo === "emprestimos") {
          todasTransacoes = todasTransacoes.filter(t => t.categoria === "emprestimo");
        } else if (tipo === "compras") {
          todasTransacoes = todasTransacoes.filter(t => t.categoria === "compra");
        }
      }

      // Ordena por data (mais recente primeiro)
      todasTransacoes.sort((a, b) => b.data - a.data);

      if (todasTransacoes.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0x95a5a6)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("📊 Histórico vazio")
          .setDescription("Você ainda não possui transações registradas.")
          .setFooter({
            text: "Nexus Bot • Economia • Histórico",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Calcula paginação
      const totalPaginas = Math.ceil(todasTransacoes.length / itensPorPagina);
      const inicio = (pagina - 1) * itensPorPagina;
      const fim = inicio + itensPorPagina;
      const transacoesPagina = todasTransacoes.slice(inicio, fim);

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("📊 Histórico de Transações")
        .setDescription(`Mostrando transações ${inicio + 1}-${Math.min(fim, todasTransacoes.length)} de ${todasTransacoes.length}`)
        .setThumbnail(interaction.client.user.displayAvatarURL());

      // Adiciona campo com o tipo de histórico
      const tiposHistorico = {
        todas: "💰 Todas as transações",
        enviadas: "📤 Transferências enviadas",
        recebidas: "📥 Transferências recebidas",
        investimentos: "💼 Investimentos",
        emprestimos: "🏦 Empréstimos",
        compras: "🛒 Compras"
      };

      embed.addFields({
        name: "📋 Tipo de Histórico",
        value: tiposHistorico[tipo],
        inline: false,
      });

      // Adiciona as transações da página
      let transacoesTexto = "";
      transacoesPagina.forEach((trans, index) => {
        const data = new Date(trans.data);
        const dataFormatada = data.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        let emoji = "";
        let valorTexto = "";
        
        if (trans.tipo === "enviada") {
          emoji = "📤";
          valorTexto = `-${trans.valor.toLocaleString("pt-BR")} Nexitos`;
        } else if (trans.tipo === "recebida") {
          emoji = "📥";
          valorTexto = `+${trans.valor.toLocaleString("pt-BR")} Nexitos`;
        } else if (trans.tipo === "investimento") {
          emoji = "💼";
          valorTexto = `+${trans.valor.toLocaleString("pt-BR")} Nexitos`;
        } else if (trans.tipo === "emprestimo") {
          emoji = "🏦";
          valorTexto = `+${trans.valor.toLocaleString("pt-BR")} Nexitos`;
        } else if (trans.tipo === "pagamento") {
          emoji = "💸";
          valorTexto = `${trans.valor.toLocaleString("pt-BR")} Nexitos`;
        } else if (trans.tipo === "compra") {
          emoji = "🛒";
          valorTexto = "Item comprado";
        }

        transacoesTexto += `${emoji} **${trans.descricao}**\n└ ${dataFormatada} - ${valorTexto}\n`;
        
        if (trans.motivo && trans.motivo !== "Transferência") {
          transacoesTexto += `└ Motivo: ${trans.motivo}\n`;
        }
        
        if (trans.taxa > 0) {
          transacoesTexto += `└ Taxa: ${trans.taxa.toLocaleString("pt-BR")} Nexitos\n`;
        }
        
        transacoesTexto += "\n";
      });

      embed.addFields({
        name: "📋 Transações",
        value: transacoesTexto,
        inline: false,
      });

      // Adiciona informações de paginação
      if (totalPaginas > 1) {
        embed.addFields({
          name: "📄 Paginação",
          value: `Página **${pagina}** de **${totalPaginas}**`,
          inline: true,
        });
      }

      // Adiciona estatísticas
      const totalEnviado = todasTransacoes.filter(t => t.tipo === "enviada").reduce((sum, t) => sum + Math.abs(t.valor), 0);
      const totalRecebido = todasTransacoes.filter(t => t.tipo === "recebida").reduce((sum, t) => sum + t.valor, 0);
      const totalTaxas = todasTransacoes.reduce((sum, t) => sum + t.taxa, 0);

      embed.addFields({
        name: "📈 Estatísticas",
        value: `**Total enviado:** ${totalEnviado.toLocaleString("pt-BR")} Nexitos\n**Total recebido:** ${totalRecebido.toLocaleString("pt-BR")} Nexitos\n**Total em taxas:** ${totalTaxas.toLocaleString("pt-BR")} Nexitos`,
        inline: false,
      });

      embed.setFooter({
        text: `Nexus Bot • Economia • Histórico • Página ${pagina}/${totalPaginas}`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /historico:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao acessar o histórico. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
