const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sacar")
    .setDescription("Saca dinheiro da sua conta bancária para a carteira")
    .addIntegerOption((option) =>
      option
        .setName("quantia")
        .setDescription("Valor para sacar")
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

    if (userData.bank < quantia) {
      return interaction.reply({
        content: "Você não tem essa quantia no banco para sacar.",
        ephemeral: true,
      });
    }

    userData.bank -= quantia;
    userData.money += quantia;
    await userData.save();

    const embed = new EmbedBuilder()
      .setColor("#e67e22")
      .setTitle("🏦 Saque realizado!")
      .setDescription(
        `Você sacou **${quantia.toLocaleString()} Nexitos** do banco para a carteira.`
      )
      .addFields(
        { name: "Banco", value: userData.bank.toLocaleString(), inline: true },
        {
          name: "Carteira",
          value: userData.money.toLocaleString(),
          inline: true,
        }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};