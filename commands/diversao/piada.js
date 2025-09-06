const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("piada")
    .setDescription("Conta uma piada aleatória 😆"),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      // URL do JSON no GitHub (RAW)
      const url =
        "https://gist.githubusercontent.com/henrycunh/75abcf44146d5d9c0714932a386dbbf1/raw/558b97a002d578998720d76458641d4782c97d34/trocadilhos.json";
      const response = await fetch(url);
      const piadas = await response.json();

      // Escolher piada aleatória
      const piada = piadas[Math.floor(Math.random() * piadas.length)];

      // Criar embed
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("🤣 Piada Aleatória")
        .addFields(
          { name: "Pergunta", value: piada.pergunta },
          { name: "Resposta", value: `||${piada.resposta}||` }
        )
        .setFooter({ text: "Piada gerada com amor ❤️" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Ocorreu um erro ao buscar uma piada.");
    }
  },
};