const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("juros")
    .setDescription("Sistema de juros sobre depósitos no banco")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("Mostra informações sobre juros do banco")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("coletar")
        .setDescription("Coleta juros acumulados no banco")
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const userData = await getUser(userId, guildId);

      if (subcommand === "info") {
        // Configurações de juros
        const taxaJuros = 0.02; // 2% ao dia
        const jurosMaximos = 0.10; // Máximo de 10% do valor depositado
        const tempoMinimo = 24 * 60 * 60 * 1000; // 24 horas em ms

        const agora = Date.now();
        const ultimaColeta = userData.ultimaColetaJuros || 0;
        const tempoDesdeUltimaColeta = agora - ultimaColeta;

        // Calcula juros disponíveis
        let jurosDisponiveis = 0;
        let jurosMaximosCalculados = 0;
        let tempoRestante = 0;

        if (userData.bank > 0) {
          jurosMaximosCalculados = Math.floor(userData.bank * jurosMaximos);
          
          if (tempoDesdeUltimaColeta >= tempoMinimo) {
            const diasPassados = Math.floor(tempoDesdeUltimaColeta / (24 * 60 * 60 * 1000));
            jurosDisponiveis = Math.floor(userData.bank * taxaJuros * diasPassados);
            
            // Limita aos juros máximos
            jurosDisponiveis = Math.min(jurosDisponiveis, jurosMaximosCalculados);
          } else {
            tempoRestante = tempoMinimo - tempoDesdeUltimaColeta;
          }
        }

        const embed = new EmbedBuilder()
          .setColor(0x3498db)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("🏦 Sistema de Juros do Banco")
          .setDescription(`Informações sobre juros sobre seus depósitos`)
          .setThumbnail(interaction.client.user.displayAvatarURL());

        // Informações sobre juros
        embed.addFields({
          name: "📊 Configurações de Juros",
          value: `**Taxa diária:** ${(taxaJuros * 100)}%\n**Juros máximos:** ${(jurosMaximos * 100)}% do valor depositado\n**Tempo mínimo:** 24 horas entre coletas`,
          inline: false,
        });

        // Status atual
        embed.addFields({
          name: "💰 Status Atual",
          value: `**Dinheiro no banco:** ${userData.bank.toLocaleString("pt-BR")} Nexitos\n**Juros máximos possíveis:** ${jurosMaximosCalculados.toLocaleString("pt-BR")} Nexitos`,
          inline: true,
        });

        // Juros disponíveis
        if (jurosDisponiveis > 0) {
          embed.addFields({
            name: "✅ Juros Disponíveis",
            value: `**${jurosDisponiveis.toLocaleString("pt-BR")} Nexitos**\nUse \`/juros coletar\` para coletar!`,
            inline: true,
          });
        } else if (tempoRestante > 0) {
          const horasRestantes = Math.floor(tempoRestante / (60 * 60 * 1000));
          const minutosRestantes = Math.floor((tempoRestante % (60 * 60 * 1000)) / (60 * 1000));
          
          embed.addFields({
            name: "⏳ Próxima Coleta",
            value: `**${horasRestantes}h ${minutosRestantes}m** restantes\nJuros acumulando...`,
            inline: true,
          });
        } else {
          embed.addFields({
            name: "❌ Sem Juros",
            value: "Você não tem dinheiro no banco para gerar juros.",
            inline: true,
          });
        }

        // Histórico de juros
        if (userData.jurosColetados && userData.jurosColetados.length > 0) {
          const totalJurosColetados = userData.jurosColetados.reduce((sum, j) => sum + j.valor, 0);
          const ultimaColetaJuros = userData.jurosColetados[userData.jurosColetados.length - 1];
          
          embed.addFields({
            name: "📈 Histórico de Juros",
            value: `**Total coletado:** ${totalJurosColetados.toLocaleString("pt-BR")} Nexitos\n**Última coleta:** ${ultimaColetaJuros.valor.toLocaleString("pt-BR")} Nexitos`,
            inline: true,
          });
        }

        embed.setFooter({
          text: "Nexus Bot • Economia • Juros",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === "coletar") {
        const taxaJuros = 0.02; // 2% ao dia
        const jurosMaximos = 0.10; // Máximo de 10% do valor depositado
        const tempoMinimo = 24 * 60 * 60 * 1000; // 24 horas em ms

        const agora = Date.now();
        const ultimaColeta = userData.ultimaColetaJuros || 0;
        const tempoDesdeUltimaColeta = agora - ultimaColeta;

        if (userData.bank <= 0) {
          return interaction.reply({
            content: "❌ Você não tem dinheiro no banco para gerar juros.",
            ephemeral: true,
          });
        }

        if (tempoDesdeUltimaColeta < tempoMinimo) {
          const tempoRestante = tempoMinimo - tempoDesdeUltimaColeta;
          const horasRestantes = Math.floor(tempoRestante / (60 * 60 * 1000));
          const minutosRestantes = Math.floor((tempoRestante % (60 * 60 * 1000)) / (60 * 1000));
          
          return interaction.reply({
            content: `⏳ Você precisa esperar mais **${horasRestantes}h ${minutosRestantes}m** antes de coletar juros novamente.`,
            ephemeral: true,
          });
        }

        // Calcula juros
        const diasPassados = Math.floor(tempoDesdeUltimaColeta / (24 * 60 * 60 * 1000));
        let jurosCalculados = Math.floor(userData.bank * taxaJuros * diasPassados);
        
        // Limita aos juros máximos
        const jurosMaximosCalculados = Math.floor(userData.bank * jurosMaximos);
        jurosCalculados = Math.min(jurosCalculados, jurosMaximosCalculados);

        if (jurosCalculados <= 0) {
          return interaction.reply({
            content: "❌ Nenhum juro disponível para coleta no momento.",
            ephemeral: true,
          });
        }

        // Adiciona juros à carteira
        userData.money += jurosCalculados;
        userData.ultimaColetaJuros = agora;

        // Registra a coleta de juros
        if (!userData.jurosColetados) userData.jurosColetados = [];
        userData.jurosColetados.push({
          valor: jurosCalculados,
          data: agora,
          diasPassados: diasPassados
        });

        await userData.save();

        const embed = new EmbedBuilder()
          .setColor(0x27ae60)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("💰 Juros Coletados!")
          .setDescription(`Você coletou juros do seu dinheiro no banco!`)
          .addFields(
            {
              name: "💵 Juros coletados",
              value: `**${jurosCalculados.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "📅 Período",
              value: `**${diasPassados} dias**`,
              inline: true,
            },
            {
              name: "🏦 Dinheiro no banco",
              value: `**${userData.bank.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "💰 Nova carteira",
              value: `**${userData.money.toLocaleString("pt-BR")} Nexitos**`,
              inline: true,
            },
            {
              name: "⏰ Próxima coleta",
              value: `<t:${Math.floor((agora + tempoMinimo) / 1000)}:R>`,
              inline: true,
            }
          )
          .setFooter({
            text: "Nexus Bot • Economia • Juros",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error("Erro no /juros:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao processar os juros. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
