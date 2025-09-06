const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addemoji")
    .setDescription("Adiciona um emoji personalizado ao servidor")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("URL da imagem do emoji")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nome")
        .setDescription("Nome do emoji (sem espaços)")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageEmojisAndStickers
      )
    ) {
      return interaction.reply({
        content:
          "❌ Você precisa da permissão de Gerenciar Emojis para usar este comando.",
        ephemeral: true,
      });
    }

    const url = interaction.options.getString("url");
    const name = interaction.options.getString("nome");

    // Validação simples da URL da imagem (pode melhorar)
    if (!url.match(/\.(png|jpg|jpeg|gif)$/i)) {
      return interaction.reply({
        content:
          "❌ A URL deve ser de uma imagem válida (png, jpg, jpeg ou gif).",
        ephemeral: true,
      });
    }

    try {
      const emoji = await interaction.guild.emojis.create({
        attachment: url,
        name,
      });

      const embed = new EmbedBuilder()
        .setTitle("Emoji adicionado com sucesso!")
        .setDescription(`Emoji ${emoji} criado com o nome \`${name}\``)
        .setColor("#ffa500")
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "❌ Não consegui adicionar o emoji. Verifique se a URL é válida e se tenho permissões.",
        ephemeral: true,
      });
    }
  },
};