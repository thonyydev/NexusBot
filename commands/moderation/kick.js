const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa um usuário do servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário a ser expulso")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo da expulsão")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");
    const motivo =
      interaction.options.getString("motivo") || "Motivo não especificado";

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "❌ Usuário não encontrado no servidor.",
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: "❌ Não posso expulsar esse usuário. Verifique as permissões.",
        ephemeral: true,
      });
    }

    try {
      await member.kick(motivo);

      const embed = new EmbedBuilder()
        .setTitle("👢 Usuário Expulso")
        .setColor("#ff4500")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: "👤 Usuário",
            value: `${user.tag} (\`${user.id}\`)`,
            inline: true,
          },
          { name: "🛠️ Expulso por", value: interaction.user.tag, inline: true },
          { name: "📄 Motivo", value: motivo }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ Não foi possível expulsar esse usuário.",
        ephemeral: true,
      });
    }
  },
};