const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silencia temporariamente um usuário no servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário que será silenciado")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tempo")
        .setDescription("Tempo em minutos")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo do mute")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const tempo = interaction.options.getInteger("tempo");
    const motivo =
      interaction.options.getString("motivo") || "Motivo não especificado";

    if (tempo < 1 || tempo > 10080) {
      // limite de 7 dias
      return interaction.reply({
        content:
          "❌ O tempo deve ser entre **1** e **10080** minutos (7 dias).",
        ephemeral: true,
      });
    }

    const membro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!membro) {
      return interaction.reply({
        content: "❌ Usuário não encontrado no servidor.",
        ephemeral: true,
      });
    }

    if (!membro.moderatable) {
      return interaction.reply({
        content:
          "❌ Não consigo mutar esse usuário. Verifique se meu cargo está acima do dele.",
        ephemeral: true,
      });
    }

    if (membro.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ Você não pode se mutar.",
        ephemeral: true,
      });
    }

    if (membro.id === interaction.client.user.id) {
      return interaction.reply({
        content: "❌ Eu não posso me mutar.",
        ephemeral: true,
      });
    }

    await membro
      .timeout(
        tempo * 60 * 1000,
        `${motivo} | Mutado por ${interaction.user.tag}`
      )
      .catch(() => {
        return interaction.reply({
          content: "❌ Ocorreu um erro ao tentar mutar o usuário.",
          ephemeral: true,
        });
      });

    const embed = new EmbedBuilder()
      .setTitle("🔇 Usuário Mutado")
      .setColor("#ff9900")
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "👤 Usuário",
          value: `${usuario.tag} (\`${usuario.id}\`)`,
          inline: true,
        },
        {
          name: "🛠️ Mutado por",
          value: `${interaction.user.tag}`,
          inline: true,
        },
        { name: "⏳ Tempo", value: `${tempo} minuto(s)`, inline: true },
        { name: "📄 Motivo", value: motivo, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};