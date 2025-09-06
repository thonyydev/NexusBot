const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Muda o apelido de um usuário")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário para mudar o apelido")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("apelido")
        .setDescription("Novo apelido (deixe vazio para remover)")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageNicknames
      )
    ) {
      return interaction.reply({
        content:
          "❌ Você precisa da permissão 'Gerenciar Apelidos' para usar este comando.",
        ephemeral: true,
      });
    }

    const member = interaction.guild.members.cache.get(
      interaction.options.getUser("usuário").id
    );
    if (!member) {
      return interaction.reply({
        content: "❌ Usuário não encontrado no servidor.",
        ephemeral: true,
      });
    }

    const novoApelido = interaction.options.getString("apelido") || null;

    try {
      await member.setNickname(novoApelido);

      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("Apelido Alterado")
        .setDescription(
          novoApelido
            ? `O apelido de ${member.user.tag} foi alterado para **${novoApelido}**.`
            : `O apelido de ${member.user.tag} foi removido.`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content:
          "❌ Não foi possível alterar o apelido. Verifique as permissões do bot e do usuário.",
        ephemeral: true,
      });
    }
  },
};