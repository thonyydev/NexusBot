const { EmbedBuilder } = require("discord.js");
const Guild = require("../models/Guild");

module.exports = {
  name: "guildMemberRemove",
  once: false,
  async execute(member) {
    try {
      const guildData = await Guild.findOne({ guildId: member.guild.id });
      if (!guildData) return;
      if (!guildData.sistemas.mensagensBoasVindas) return;
      if (!guildData.leaveChannel) return;

      const channel = member.guild.channels.cache.get(guildData.leaveChannel);
      if (!channel) return;

      let message = guildData.leaveMessage || "{user} saiu do servidor 😢";
      message = message.replace("{user}", member.user.tag);

      const embed = new EmbedBuilder()
        .setColor("#5B2C6F") // roxo escuro sofisticado
        .setTitle("Sentiremos sua falta 😢")
        .setDescription(
          `*${message}*\n\nSe quiser, você sempre pode voltar para a gente! ❤️`
        )
        .setThumbnail(
          member.user.displayAvatarURL({ dynamic: true, size: 256 })
        )
        .setTimestamp()
        .setFooter({
          text: `Volte sempre ao ${member.guild.name}`,
          iconURL: member.guild.iconURL(),
        });

      channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Erro no guildMemberRemove:", err);
    }
  },
};
