const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transferir")
    .setDescription("Transfere dinheiro para outro usuário")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário para quem você quer transferir")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("quantia")
        .description("Quantia para transferir")
        .setRequired(true)
        .setMinValue(100)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo da transferência (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const senderId = interaction.user.id;
      const guildId = interaction.guild.id;
      const receiverUser = interaction.options.getUser("usuario");
      const amount = interaction.options.getInteger("quantia");
      const motivo = interaction.options.getString("motivo") || "Transferência";

      if (receiverUser.id === senderId) {
        return interaction.reply({
          content: "❌ Você não pode transferir dinheiro para si mesmo!",
          ephemeral: true,
        });
      }

      if (receiverUser.bot) {
        return interaction.reply({
          content: "❌ Você não pode transferir dinheiro para bots!",
          ephemeral: true,
        });
      }

      // Pega os dados dos usuários
      const senderData = await getUser(senderId, guildId);
      const receiverData = await getUser(receiverUser.id, guildId);

      if (senderData.money < amount) {
        return interaction.reply({
          content: `❌ Saldo insuficiente! Você tem apenas **${senderData.money.toLocaleString("pt-BR")} Nexitos**.`,
          ephemeral: true,
        });
      }

      // Calcula taxa de transferência
      let taxa = 0;
      let taxaPercentual = 0;
      
      if (amount <= 1000) {
        taxa = 0; // Sem taxa para transferências pequenas
        taxaPercentual = 0;
      } else if (amount <= 5000) {
        taxa = Math.floor(amount * 0.01); // 1% de taxa
        taxaPercentual = 1;
      } else if (amount <= 20000) {
        taxa = Math.floor(amount * 0.02); // 2% de taxa
        taxaPercentual = 2;
      } else {
        taxa = Math.floor(amount * 0.05); // 5% de taxa
        taxaPercentual = 5;
      }

      const valorRecebido = amount - taxa;
      const valorTotal = amount + taxa;

      if (senderData.money < valorTotal) {
        return interaction.reply({
          content: `❌ Saldo insuficiente! Você precisa de **${valorTotal.toLocaleString("pt-BR")} Nexitos** (${amount.toLocaleString("pt-BR")} + ${taxa.toLocaleString("pt-BR")} de taxa).`,
          ephemeral: true,
        });
      }

      // Executa a transferência
      senderData.money -= valorTotal;
      receiverData.money += valorRecebido;

      // Registra a transferência no histórico
      if (!senderData.transferencias) senderData.transferencias = [];
      if (!receiverData.transferencias) receiverData.transferencias = [];

      const transferencia = {
        id: Date.now().toString(),
        de: senderId,
        para: receiverUser.id,
        quantia: amount,
        taxa: taxa,
        valorRecebido: valorRecebido,
        motivo: motivo,
        data: Date.now()
      };

      senderData.transferencias.push(transferencia);
      receiverData.transferencias.push(transferencia);

      await senderData.save();
      await receiverData.save();

      // Embed para o remetente
      const embedSender = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("💸 Transferência enviada!")
        .setDescription(`Você transferiu dinheiro para **${receiverUser.username}**`)
        .addFields(
          {
            name: "💰 Valor transferido",
            value: `**${amount.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "💸 Taxa cobrada",
            value: `**${taxa.toLocaleString("pt-BR")} Nexitos** (${taxaPercentual}%)`,
            inline: true,
          },
          {
            name: "🏦 Total debitado",
            value: `**${valorTotal.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📝 Motivo",
            value: motivo,
            inline: false,
          },
          {
            name: "🏦 Saldo restante",
            value: `**${senderData.money.toLocaleString("pt-BR")} Nexitos**`,
            inline: false,
          }
        )
        .setFooter({
          text: "Nexus Bot • Economia • Transferências",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Embed para o destinatário
      const embedReceiver = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setAuthor({
          name: `${receiverUser.tag}`,
          iconURL: receiverUser.displayAvatarURL(),
        })
        .setTitle("💰 Transferência recebida!")
        .setDescription(`Você recebeu uma transferência de **${interaction.user.username}**`)
        .addFields(
          {
            name: "💰 Valor recebido",
            value: `**${valorRecebido.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📤 Valor original",
            value: `**${amount.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "💸 Taxa cobrada",
            value: `**${taxa.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📝 Motivo",
            value: motivo,
            inline: false,
          },
          {
            name: "🏦 Novo saldo",
            value: `**${receiverData.money.toLocaleString("pt-BR")} Nexitos**`,
            inline: false,
          }
        )
        .setFooter({
          text: "Nexus Bot • Economia • Transferências",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Responde para o remetente
      await interaction.reply({ embeds: [embedSender] });

      // Envia mensagem privada para o destinatário (se possível)
      try {
        await receiverUser.send({ embeds: [embedReceiver] });
      } catch (error) {
        // Se não conseguir enviar DM, envia no canal
        await interaction.followUp({
          content: `${receiverUser}, você recebeu uma transferência!`,
          embeds: [embedReceiver],
        });
      }

    } catch (error) {
      console.error("Erro no /transferir:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao processar a transferência. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
