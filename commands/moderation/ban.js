const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um membro do servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário que será banido")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo do banimento")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const motivo =
      interaction.options.getString("motivo") || "Motivo não especificado";

    const membro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!membro) {
      return interaction.reply({
        content: "❌ Usuário não encontrado no servidor.",
        ephemeral: true,
      });
    }

    if (!membro.bannable) {
      return interaction.reply({
        content:
          "❌ Não consigo banir esse usuário. Verifique se meu cargo está acima do dele.",
        ephemeral: true,
      });
    }

    // Evitar que o bot ou o autor bane a si mesmo
    if (membro.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ Você não pode se banir.",
        ephemeral: true,
      });
    }

    if (membro.id === interaction.client.user.id) {
      return interaction.reply({
        content: "❌ Eu não posso me banir.",
        ephemeral: true,
      });
    }

    await membro
      .ban({ reason: `${motivo} | Banido por ${interaction.user.tag}` })
      .catch(() => {
        return interaction.reply({
          content: "❌ Ocorreu um erro ao tentar banir o usuário.",
          ephemeral: true,
        });
      });

    const embed = new EmbedBuilder()
      .setTitle("🚫 Usuário Banido")
      .setColor("#ff0000")
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "👤 Usuário",
          value: `${usuario.tag} (\`${usuario.id}\`)`,
          inline: true,
        },
        {
          name: "🛠️ Banido por",
          value: `${interaction.user.tag}`,
          inline: true,
        },
        { name: "📄 Motivo", value: motivo, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};