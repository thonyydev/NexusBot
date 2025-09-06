const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");
const process = require("process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Mostra informações sobre o bot Nexus"),

  async execute(interaction) {
    const { client } = interaction;

    // Uptime formatado (dias, horas, minutos)
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    const uptime = `${days}d ${hours}h ${minutes}m`;

    // Memória usada em MB
    const memoryUsageMB = (
      process.memoryUsage().heapUsed /
      1024 /
      1024
    ).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle("🤖 Nexus Bot - Informações")
      .setColor("#FFA500") // cor laranja/amarelo
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: "Criador", value: "Anthony (Thonyy07)", inline: true },
        {
          name: "Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        { name: "Usuários", value: `${client.users.cache.size}`, inline: true },
        {
          name: "Comandos",
          value: `${client.application.commands.cache.size}`,
          inline: true,
        },
        { name: "Uptime", value: uptime, inline: true },
        { name: "Memória usada", value: `${memoryUsageMB} MB`, inline: true },
        { name: "Node.js", value: process.version, inline: true },
        {
          name: "Discord.js",
          value: require("discord.js").version,
          inline: true,
        }
      )
      .setFooter({ text: "Nexus Bot • Desenvolvido por Anthony" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};