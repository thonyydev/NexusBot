const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove o mute de um usuário no servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário a ser desmutado")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo do desmute")
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

    if (
      !member.communicationDisabledUntil ||
      member.communicationDisabledUntil < new Date()
    ) {
      return interaction.reply({
        content: "❌ Esse usuário não está mutado.",
        ephemeral: true,
      });
    }

    try {
      await member.timeout(
        null,
        `${motivo} | Desmutado por ${interaction.user.tag}`
      );

      const embed = new EmbedBuilder()
        .setTitle("🔈 Usuário desmutado")
        .setColor("#00ff99")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: "👤 Usuário",
            value: `${user.tag} (\`${user.id}\`)`,
            inline: true,
          },
          {
            name: "🛠️ Desmutado por",
            value: interaction.user.tag,
            inline: true,
          },
          { name: "📄 Motivo", value: motivo }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ Não foi possível remover o mute desse usuário.",
        ephemeral: true,
      });
    }
  },
};