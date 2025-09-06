const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Define slowmode no canal atual")
    .addIntegerOption((option) =>
      option
        .setName("tempo")
        .setDescription("Tempo de slowmode em segundos (0 para desativar)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return interaction.reply({
        content:
          "❌ Você precisa da permissão 'Gerenciar Canais' para usar este comando.",
        ephemeral: true,
      });
    }

    const tempo = interaction.options.getInteger("tempo");
    try {
      await interaction.channel.setRateLimitPerUser(tempo);

      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("Slowmode Atualizado")
        .setDescription(
          tempo === 0
            ? "Slowmode desativado neste canal."
            : `Slowmode configurado para **${tempo} segundos**.`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content:
          "❌ Não foi possível alterar o slowmode. Verifique minhas permissões.",
        ephemeral: true,
      });
    }
  },
};