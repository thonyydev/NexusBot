const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Apaga uma quantidade de mensagens no canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("quantidade")
        .setDescription("Número de mensagens para apagar (2-100)")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("quantidade");

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setTitle("🧹 Mensagens apagadas")
        .setDescription(`Foram apagadas **${deleted.size}** mensagens.`)
        .setColor("#faa61a")
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "❌ Não foi possível apagar mensagens com mais de 14 dias ou ocorreu um erro.",
        ephemeral: true,
      });
    }
  },
};