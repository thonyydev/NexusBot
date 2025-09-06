const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Mostra o avatar do usuário ou de outro membro")
    .addStringOption((option) =>
      option
        .setName("tamanho")
        .setDescription("O tamanho do avatar (pequeno, médio, grande)")
        .setRequired(true)
        .addChoices(
          { name: "pequeno", value: "pequeno" },
          { name: "medio", value: "medio" },
          { name: "grande", value: "grande" }
        )
    )
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("O usuário cujo avatar você deseja ver")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("usuário") || interaction.user;
    const size = interaction.options.getString("tamanho") || "medio";
    let avatarUrl;

    switch (size) {
      case "pequeno":
        avatarUrl = user.displayAvatarURL({ size: 128, dynamic: true });
        break;
      case "grande":
        avatarUrl = user.displayAvatarURL({ size: 2048, dynamic: true });
        break;
      case "medio":
      default:
        avatarUrl = user.displayAvatarURL({ size: 512, dynamic: true });
        break;
    }
    await interaction.reply({
      content: `Aqui está o avatar de ${user.username}:`,
      files: [avatarUrl],
      ephemeral: true,
    });
  },
};