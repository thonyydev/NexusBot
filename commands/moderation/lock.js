const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription(
      "Trava o canal atual, impedindo membros de enviar mensagens."
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
      // Bloqueia o canal para @everyone
      await channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: false,
        }
      );

      const embed = new EmbedBuilder()
        .setColor("#f39c12")
        .setTitle("Canal bloqueado 🔒")
        .setDescription(
          `O canal ${channel} foi travado. Ninguém poderá enviar mensagens por enquanto.`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "❌ Não consegui bloquear o canal. Verifique minhas permissões e tente novamente.",
        ephemeral: true,
      });
    }
  },
};