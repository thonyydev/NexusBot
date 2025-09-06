const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbane um usuário do servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((option) =>
      option
        .setName("usuario_id")
        .setDescription("ID do usuário que será desbanido")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo do desbanimento")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuarioId = interaction.options.getString("usuario_id");
    const motivo =
      interaction.options.getString("motivo") || "Motivo não especificado";

    // Verificar se é um ID válido
    if (!/^\d{17,19}$/.test(usuarioId)) {
      return interaction.reply({
        content: "❌ Forneça um ID de usuário válido.",
        ephemeral: true,
      });
    }

    // Buscar o banimento
    const banInfo = await interaction.guild.bans
      .fetch(usuarioId)
      .catch(() => null);

    if (!banInfo) {
      return interaction.reply({
        content: "❌ Esse usuário não está banido.",
        ephemeral: true,
      });
    }

    // Desbanir
    await interaction.guild.members
      .unban(usuarioId, `${motivo} | Desbanido por ${interaction.user.tag}`)
      .catch(() => {
        return interaction.reply({
          content: "❌ Ocorreu um erro ao tentar desbanir o usuário.",
          ephemeral: true,
        });
      });

    const embed = new EmbedBuilder()
      .setTitle("✅ Usuário Desbanido")
      .setColor("#00ff99")
      .setThumbnail(banInfo.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "👤 Usuário",
          value: `${banInfo.user.tag} (\`${banInfo.user.id}\`)`,
          inline: true,
        },
        {
          name: "🛠️ Desbanido por",
          value: `${interaction.user.tag}`,
          inline: true,
        },
        { name: "📄 Motivo", value: motivo, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};