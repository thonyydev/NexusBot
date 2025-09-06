const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription(
      "Destrava o canal atual, permitindo que membros enviem mensagens."
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;

    // Verifica permissão do bot
    if (
      !channel
        .permissionsFor(interaction.guild.members.me)
        .has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return interaction.reply({
        content:
          "❌ Preciso da permissão 'Gerenciar Canais' para executar este comando.",
        ephemeral: true,
      });
    }

    try {
      // Desbloqueia o canal para @everyone
      await channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: true,
        }
      );

      const embed = new EmbedBuilder()
        .setColor("#27ae60")
        .setTitle("Canal desbloqueado 🔓")
        .setDescription(
          `O canal ${channel} foi destravado. Agora os membros podem enviar mensagens normalmente.`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "❌ Não consegui desbloquear o canal. Verifique minhas permissões e tente novamente.",
        ephemeral: true,
      });
    }
  },
};