const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Envia um meme aleatório"),
  async execute(interaction) {
    try {
      const response = await fetch("https://meme-api.com/gimme/memesbrasil");
      const data = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setImage(data.url)
        .setColor("#FFA500")
        .setFooter({ text: "Nexus Bot • Meme" });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "Não consegui pegar um meme agora 😢 Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};