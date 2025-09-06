const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emprestimo")
    .setDescription("Sistema de empréstimos com juros")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pegar")
        .setDescription("Pega um empréstimo")
        .addIntegerOption((option) =>
          option
            .setName("quantia")
            .setDescription("Quantia para emprestar")
            .setRequired(true)
            .setMinValue(1000)
            .setMaxValue(50000)
        )
        .addIntegerOption((option) =>
          option
            .setName("prazo")
            .setDescription("Prazo para pagar (em dias)")
            .setRequired(true)
            .addChoices(
              { name: "7 dias (5% juros)", value: 7 },
              { name: "15 dias (10% juros)", value: 15 },
              { name: "30 dias (20% juros)", value: 30 }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pagar")
        .setDescription("Paga um empréstimo ativo")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Mostra status dos seus empréstimos")
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const userData = await getUser(userId, guildId);

      if (subcommand === "pegar") {
        const quantia = interaction.options.getInteger("quantia");
        const prazo = interaction.options.getInteger("prazo");

        // Verifica se já tem empréstimo ativo
        if (userData.emprestimos && userData.emprestimos.some(emp => emp.ativo)) {
          return interaction.reply({
            content: "❌ Você já possui um empréstimo ativo. Pague-o primeiro antes de pegar outro.",
            ephemeral: true,
          });
        }

        // Calcula juros baseado no prazo
        const jurosPorPrazo = {
          7: 0.05,   // 5% para 7 dias
          15: 0.10,  // 10% para 15 dias
          30: 0.20   // 20% para 30 dias
        };

        const juros = jurosPorPrazo[prazo];
        const valorJuros = Math.floor(quantia * juros);
        const valorTotal = quantia + valorJuros;
        const dataVencimento = Date.now() + (prazo * 24 * 60 * 60 * 1000);

        // Cria o empréstimo
        if (!userData.emprestimos) userData.emprestimos = [];
        
        const emprestimo = {
          id: Date.now().toString(),
          quantia: quantia,
          juros: valorJuros,
          valorTotal: valorTotal,
          prazo: prazo,
          dataEmprestimo: Date.now(),
          dataVencimento: dataVencimento,
          ativo: true,
          pago: false
        };

        userData.emprestimos.push(emprestimo);
        userData.money += quantia;
        await userData.save();

        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("💰 Empréstimo aprovado!")
          .setDescription(`Seu empréstimo foi aprovado com sucesso!`)
          .addFields(
            {
              name: "💵 Quantia emprestada",
              value: `**${quantia.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "📅 Prazo",
              value: `**${prazo} dias**`,
              inline: true,
            },
            {
              name: "💸 Juros",
              value: `**${valorJuros.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "🏦 Valor total a pagar",
              value: `**${valorTotal.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "⏰ Data de vencimento",
              value: `<t:${Math.floor(dataVencimento / 1000)}:F>`,
              inline: true,
            },
            {
              name: "💡 Como pagar",
              value: "Use `/emprestimo pagar` quando quiser pagar o empréstimo!",
              inline: false,
            }
          )
          .setFooter({
            text: "Nexus Bot • Economia • Empréstimos",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === "pagar") {
        if (!userData.emprestimos || !userData.emprestimos.some(emp => emp.ativo)) {
          return interaction.reply({
            content: "❌ Você não possui empréstimos ativos para pagar.",
            ephemeral: true,
          });
        }

        const emprestimoAtivo = userData.emprestimos.find(emp => emp.ativo);
        
        if (userData.money < emprestimoAtivo.valorTotal) {
          return interaction.reply({
            content: `❌ Saldo insuficiente! Você precisa de **${emprestimoAtivo.valorTotal.toLocaleString("pt-BR")} Nexitos** para pagar o empréstimo.`,
            ephemeral: true,
          });
        }

        // Paga o empréstimo
        userData.money -= emprestimoAtivo.valorTotal;
        emprestimoAtivo.ativo = false;
        emprestimoAtivo.pago = true;
        emprestimoAtivo.dataPagamento = Date.now();
        
        await userData.save();

        const embed = new EmbedBuilder()
          .setColor(0x27ae60)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("✅ Empréstimo pago!")
          .setDescription(`Você pagou seu empréstimo com sucesso!`)
          .addFields(
            {
              name: "💵 Valor pago",
              value: `**${emprestimoAtivo.valorTotal.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "🏦 Saldo restante",
              value: `**${userData.money.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "📅 Prazo utilizado",
              value: `**${emprestimoAtivo.prazo} dias**`,
              inline: true,
            }
          )
          .setFooter({
            text: "Nexus Bot • Economia • Empréstimos",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === "status") {
        if (!userData.emprestimos || userData.emprestimos.length === 0) {
          return interaction.reply({
            content: "❌ Você não possui histórico de empréstimos.",
            ephemeral: true,
          });
        }

        const emprestimosAtivos = userData.emprestimos.filter(emp => emp.ativo);
        const emprestimosPagos = userData.emprestimos.filter(emp => emp.pago);

        const embed = new EmbedBuilder()
          .setColor(0x3498db)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("📊 Status dos Empréstimos")
          .setDescription(`Histórico completo dos seus empréstimos`);

        // Empréstimos ativos
        if (emprestimosAtivos.length > 0) {
          const emprestimoAtivo = emprestimosAtivos[0];
          const tempoRestante = emprestimoAtivo.dataVencimento - Date.now();
          const diasRestantes = Math.floor(tempoRestante / (24 * 60 * 60 * 1000));
          const horasRestantes = Math.floor((tempoRestante % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

          embed.addFields({
            name: "⏳ Empréstimo Ativo",
            value: `**Quantia:** ${emprestimoAtivo.quantia.toLocaleString("pt-BR")} Nexitos\n**Valor total:** ${emprestimoAtivo.valorTotal.toLocaleString("pt-BR")} Nexitos\n**Prazo restante:** ${diasRestantes}d ${horasRestantes}h\n**Vencimento:** <t:${Math.floor(emprestimoAtivo.dataVencimento / 1000)}:F>`,
            inline: false,
          });
        }

        // Estatísticas gerais
        const totalEmprestimos = userData.emprestimos.length;
        const totalEmprestado = userData.emprestimos.reduce((sum, emp) => sum + emp.quantia, 0);
        const totalJuros = userData.emprestimos.reduce((sum, emp) => sum + emp.juros, 0);
        const totalPago = userData.emprestimos.filter(emp => emp.pago).reduce((sum, emp) => sum + emp.valorTotal, 0);

        embed.addFields({
          name: "📈 Estatísticas Gerais",
          value: `**Total de empréstimos:** ${totalEmprestimos}\n**Total emprestado:** ${totalEmprestado.toLocaleString("pt-BR")} Nexitos\n**Total de juros:** ${totalJuros.toLocaleString("pt-BR")} Nexitos\n**Total pago:** ${totalPago.toLocaleString("pt-BR")} Nexitos`,
          inline: false,
        });

        embed.setFooter({
          text: "Nexus Bot • Economia • Empréstimos",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error("Erro no /emprestimo:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao processar o empréstimo. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
