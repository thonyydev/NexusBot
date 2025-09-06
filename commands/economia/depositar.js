const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("depositar")
    .setDescription("Deposita dinheiro na sua conta bancária")
    .addIntegerOption((option) =>
      option
        .setName("quantia")
        .setDescription("Valor para depositar")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const quantia = interaction.options.getInteger("quantia");

    const userData = await getUser(userId, guildId);

    if (!userData) {
      return interaction.reply({
        content: "Usuário não encontrado.",
        ephemeral: true,
      });
    }

    if (userData.money < quantia) {
      return interaction.reply({
        content: "Você não tem essa quantia em carteira para depositar.",
        ephemeral: true,
      });
    }

    userData.money -= quantia;
    userData.bank += quantia;
    await userData.save();

    const embed = new EmbedBuilder()
      .setColor("#1abc9c")
      .setTitle("💰 Depósito realizado!")
      .setDescription(
        `Você depositou **${quantia.toLocaleString()} Nexitos** no banco.`
      )
      .addFields(
        {
          name: "Carteira",
          value: userData.money.toLocaleString(),
          inline: true,
        },
        { name: "Banco", value: userData.bank.toLocaleString(), inline: true }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};