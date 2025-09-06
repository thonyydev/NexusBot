const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pague uma quantia para outro usuário")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("O usuário para quem você quer pagar")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("quantia")
        .setDescription("A quantia que você quer pagar")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      const payerId = interaction.user.id;
      const guildId = interaction.guild.id;

      const payeeUser = interaction.options.getUser("usuario");
      const amount = interaction.options.getInteger("quantia");

      if (payeeUser.id === payerId) {
        return interaction.reply({
          content: "❌ Você não pode pagar para si mesmo!",
          ephemeral: true,
        });
      }

      // Pega os dados dos dois usuários no banco
      const payerData = await getUser(payerId, guildId);
      const payeeData = await getUser(payeeUser.id, guildId);

      if (payerData.money < amount) {
        return interaction.reply({
          content: `❌ Saldo insuficiente! Você tem apenas **${payerData.money.toLocaleString(
            "pt-BR"
          )} Nexitos**.`,
          ephemeral: true,
        });
      }

      if (payerData.money <= 0) {
        return interaction.reply({
          content:
            "❌ Você não tem dinheiro suficiente na carteira para pagar.",
          ephemeral: true,
        });
      }

      // Atualiza o saldo de ambos
      payerData.money -= amount;
      payeeData.money += amount;

      await payerData.save();
      await payeeData.save();

      const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle("💸 Transferência realizada")
        .setDescription(
          `${interaction.user} pagou **${amount.toLocaleString(
            "pt-BR"
          )} Nexitos** para ${payeeUser}.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /pay:", error);
      return interaction.reply({
        content:
          "❌ Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};