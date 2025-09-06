const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coletar")
    .setDescription("Coleta os retornos dos seus investimentos"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const userData = await getUser(userId, guildId);

      if (!userData.investimentos || userData.investimentos.length === 0) {
        return interaction.reply({
          content: "❌ Você não tem investimentos ativos no momento.",
          ephemeral: true,
        });
      }

      const agora = Date.now();
      const investimentosProntos = userData.investimentos.filter(
        (inv) => inv.ativo && inv.tempoRetorno <= agora
      );

      if (investimentosProntos.length === 0) {
        const proximoInvestimento = userData.investimentos
          .filter((inv) => inv.ativo)
          .sort((a, b) => a.tempoRetorno - b.tempoRetorno)[0];

        if (proximoInvestimento) {
          const tempoRestante = proximoInvestimento.tempoRetorno - agora;
          const horas = Math.floor(tempoRestante / (60 * 60 * 1000));
          const minutos = Math.floor((tempoRestante % (60 * 60 * 1000)) / (60 * 1000));

          return interaction.reply({
            content: `⏳ Nenhum investimento está pronto para coleta ainda. O próximo estará disponível em **${horas}h ${minutos}m**.`,
            ephemeral: true,
          });
        }
      }

      let totalColetado = 0;
      let investimentosColetados = [];

      for (const investimento of investimentosProntos) {
        totalColetado += investimento.totalRetorno;
        investimentosColetados.push(investimento);
        
        // Marca como coletado
        investimento.ativo = false;
        investimento.coletadoEm = Date.now();
      }

      // Adiciona dinheiro à carteira
      userData.money += totalColetado;
      await userData.save();

      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("💰 Investimentos coletados!")
        .setDescription(`Você coletou **${totalColetado.toLocaleString("pt-BR")} Nexitos** dos seus investimentos!`)
        .addFields(
          {
            name: "📊 Total coletado",
            value: `**${totalColetado.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "🏦 Saldo atual",
            value: `**${userData.money.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📈 Investimentos coletados",
            value: `**${investimentosColetados.length}**`,
            inline: true,
          }
        );

      // Adiciona detalhes dos investimentos coletados
      if (investimentosColetados.length > 0) {
        const detalhes = investimentosColetados.map((inv, index) => {
          const tipos = {
            poupanca: "💼 Poupança",
            acoes: "📈 Ações",
            cripto: "🚀 Cripto",
            imoveis: "🏠 Imóveis"
          };
          return `${index + 1}. ${tipos[inv.tipo]} - **${inv.totalRetorno.toLocaleString("pt-BR")} Nexitos**`;
        }).join('\n');

        embed.addFields({
          name: "📋 Detalhes dos investimentos",
          value: detalhes,
          inline: false,
        });
      }

      embed.setFooter({
        text: "Nexus Bot • Economia • Investimentos",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /coletar:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao coletar os investimentos. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
