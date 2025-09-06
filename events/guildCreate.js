const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild) {
    try {
      // Encontra um canal de texto onde o bot possa enviar mensagem
      const channel = guild.channels.cache.find(
        (ch) =>
          ch.type === 0 && // Canal de texto (discord.js v14)
          ch.permissionsFor(guild.members.me).has("SendMessages")
      );
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#5865F2") // Azul Discord, vibrante e agradável
        .setTitle("🎉 Obrigado por me adicionar! 🎉")
        .setDescription(
          `Olá, **${guild.name}**! Estou muito feliz de fazer parte do seu servidor!  
        
Para começar, digite \`/help\` e veja tudo que eu posso fazer para ajudar sua comunidade crescer e se divertir.

Se precisar de ajuda ou quiser dar sugestões, fique à vontade para entrar no meu servidor de suporte.`
        )
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }) || null)
        .setTimestamp()
        .setFooter({
          text: "Nexus ─ Seu bot favorito 🤖",
          iconURL: guild.client.user.displayAvatarURL(),
        });

      channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no evento guildCreate:", error);
    }
  },
};
