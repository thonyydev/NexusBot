const { EmbedBuilder } = require("discord.js");
const Guild = require("../models/Guild");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
    try {
      const guildData = await Guild.findOne({
        guildId: member.guild.id,
      });
      if (!guildData) return;

      if (!guildData.sistemas.mensagensBoasVindas) return;

      if (!guildData.welcomeChannel) return;

      const channel = member.guild.channels.cache.get(guildData.welcomeChannel);
      if (!channel) return;

      let message = guildData.welcomeMessage || "Seja bem-vindo(a), {user}!";
      message = message.replace("{user}", `<@${member.id}>`);

      const embed = new EmbedBuilder()
        .setColor("#2ecc71") // verde esmeralda sofisticado
        .setTitle("Boas-vindas! 🎉")
        .setDescription(
          `*${message}*\n\nFicamos felizes em ter você conosco! 🎊`
        )
        .setThumbnail(
          member.user.displayAvatarURL({ dynamic: true, size: 256 })
        )
        .addFields([
          {
            name: "Dica:",
            value:
              "_Explore os canais e interaja com a comunidade para aproveitar ao máximo!_",
          },
        ])
        .setTimestamp()
        .setFooter({
          text: `Seja bem-vindo(a) ao ${member.guild.name}!`,
          iconURL: member.guild.iconURL(),
        });

      channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Erro no guildMemberAdd:", err);
    }
  },
};