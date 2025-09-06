const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../../models/Guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configwelcome")
    .setDescription("Configura o sistema de boas-vindas e despedidas.")
    .addChannelOption((option) =>
      option
        .setName("canalboasvindas")
        .setDescription("Canal para mensagens de boas-vindas")
        .setRequired(true)
        .addChannelTypes(0)
    ) // 0 = GUILD_TEXT
    .addChannelOption((option) =>
      option
        .setName("canaldespedida")
        .setDescription("Canal para mensagens de despedida")
        .setRequired(true)
        .addChannelTypes(0)
    ) // 0 = GUILD_TEXT
    .addStringOption((option) =>
      option
        .setName("mensagemboasvindas")
        .setDescription(
          "Mensagem personalizada de boas-vindas (use {user} para mencionar)"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("mensagemdespedida")
        .setDescription(
          "Mensagem personalizada de despedida (use {user} para mencionar)"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has("ManageGuild")) {
      return interaction.reply({
        content:
          "Você precisa da permissão de Gerenciar Servidor para usar esse comando.",
        ephemeral: true,
      });
    }

    const canalBoasVindas = interaction.options.getChannel("canalboasvindas");
    const canalDespedida = interaction.options.getChannel("canaldespedida");
    const msgBoasVindas = interaction.options.getString("mensagemboasvindas");
    const msgDespedida = interaction.options.getString("mensagemdespedida");

    let guildData = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildData) {
      guildData = new Guild({ guildId: interaction.guild.id });
    }

    if (canalBoasVindas) guildData.welcomeChannel = canalBoasVindas.id;
    if (canalDespedida) guildData.leaveChannel = canalDespedida.id;
    if (msgBoasVindas) guildData.welcomeMessage = msgBoasVindas;
    if (msgDespedida) guildData.leaveMessage = msgDespedida;

    await guildData.save();

    let reply = "Configurações atualizadas com sucesso!\n";
    if (canalBoasVindas)
      reply += `Canal de boas-vindas configurado para: ${canalBoasVindas.toString()}\n`;
    if (canalDespedida)
      reply += `Canal de despedida configurado para: ${canalDespedida.toString()}\n`;
    if (msgBoasVindas) reply += `Mensagem de boas-vindas atualizada.\n`;
    if (msgDespedida) reply += `Mensagem de despedida atualizada.\n`;
    if (!canalBoasVindas && !canalDespedida && !msgBoasVindas && !msgDespedida)
      reply = "Nenhuma opção foi alterada.";

    return interaction.reply({ content: reply, ephemeral: true });
  },
};
