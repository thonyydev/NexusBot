const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("investir")
    .setDescription("Investe seu dinheiro em diferentes opções")
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de investimento")
        .setRequired(true)
        .addChoices(
          { name: "💼 Poupança (Seguro)", value: "poupanca" },
          { name: "📈 Ações (Médio Risco)", value: "acoes" },
          { name: "🚀 Cripto (Alto Risco)", value: "cripto" },
          { name: "🏠 Imóveis (Baixo Risco)", value: "imoveis" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("quantia")
        .setDescription("Quantia para investir")
        .setRequired(true)
        .setMinValue(100)
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const tipo = interaction.options.getString("tipo");
      const quantia = interaction.options.getInteger("quantia");

      const userData = await getUser(userId, guildId);

      if (userData.money < quantia) {
        return interaction.reply({
          content: `❌ Saldo insuficiente! Você tem apenas **${userData.money.toLocaleString(
            "pt-BR"
          )} Nexitos**.`,
          ephemeral: true,
        });
      }

      // Configurações dos investimentos
      const investimentos = {
        poupanca: {
          nome: "Poupança",
          emoji: "💼",
          risco: "Baixo",
          retornoMin: 0.05, // 5%
          retornoMax: 0.15, // 15%
          tempoMin: 1, // 1 hora
          tempoMax: 6, // 6 horas
          descricao: "Investimento seguro com retorno garantido"
        },
        acoes: {
          nome: "Ações",
          emoji: "📈",
          risco: "Médio",
          retornoMin: 0.10, // 10%
          retornoMax: 0.40, // 40%
          tempoMin: 2, // 2 horas
          tempoMax: 12, // 12 horas
          descricao: "Investimento em ações com risco moderado"
        },
        cripto: {
          nome: "Criptomoedas",
          emoji: "🚀",
          risco: "Alto",
          retornoMin: 0.20, // 20%
          retornoMax: 1.00, // 100%
          tempoMin: 4, // 4 horas
          tempoMax: 24, // 24 horas
          descricao: "Investimento de alto risco e alto retorno"
        },
        imoveis: {
          nome: "Imóveis",
          emoji: "🏠",
          risco: "Baixo",
          retornoMin: 0.08, // 8%
          retornoMax: 0.25, // 25%
          tempoMin: 3, // 3 horas
          tempoMax: 18, // 18 horas
          descricao: "Investimento imobiliário estável"
        }
      };

      const investimento = investimentos[tipo];
      
      // Calcula retorno aleatório
      const retornoPercentual = Math.random() * (investimento.retornoMax - investimento.retornoMin) + investimento.retornoMin;
      const retorno = Math.floor(quantia * retornoPercentual);
      const totalRetorno = quantia + retorno;
      
      // Calcula tempo de retorno
      const tempoRetorno = Math.floor(Math.random() * (investimento.tempoMax - investimento.tempoMin) + investimento.tempoMin);
      const tempoRetornoMs = tempoRetorno * 60 * 60 * 1000; // Converter para milissegundos
      
      // Remove dinheiro da carteira
      userData.money -= quantia;
      
      // Adiciona investimento ativo
      if (!userData.investimentos) userData.investimentos = [];
      userData.investimentos.push({
        tipo: tipo,
        quantia: quantia,
        retorno: retorno,
        totalRetorno: totalRetorno,
        tempoRetorno: Date.now() + tempoRetornoMs,
        ativo: true
      });
      
      await userData.save();

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(`${investimento.emoji} Investimento realizado!`)
        .setDescription(`**${investimento.descricao}**`)
        .addFields(
          {
            name: "💰 Quantia investida",
            value: `**${quantia.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📊 Tipo de investimento",
            value: `${investimento.emoji} **${investimento.nome}**`,
            inline: true,
          },
          {
            name: "⚠️ Nível de risco",
            value: `**${investimento.risco}**`,
            inline: true,
          },
          {
            name: "💵 Retorno esperado",
            value: `**${retorno.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📈 Total esperado",
            value: `**${totalRetorno.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "⏰ Tempo de retorno",
            value: `**${tempoRetorno} horas**`,
            inline: true,
          }
        )
        .setFooter({
          text: "Nexus Bot • Economia • Investimentos",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /investir:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao processar o investimento. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
