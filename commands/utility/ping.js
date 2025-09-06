const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde com o ping do bot"),
  async execute(interaction) {
    await interaction.reply({
      content: `🏓 Pong! O ping é ${interaction.client.ws.ping}ms`,
      ephemeral: true,
    });
  },
};