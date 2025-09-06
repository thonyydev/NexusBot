const Guild = require("../models/Guild");

module.exports = {
  name: "messageCreate",
  /**
   * @param {import("discord.js").Message} message
   * @param {string[]} palavrasProibidas
   */
  async execute(message, palavrasProibidas) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData) {
      return;
    }
    if (!guildData.moderacao?.ativa) {
      return;
    }

    const bloquearLinks = guildData.moderacao.bloquearLinks;

    const normalize = (text) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "")
        .trim();

    const msgNormalizada = normalize(message.content);

    const temPalavraProibida = palavrasProibidas.some((palavra) => {
      const palavraNormalizada = normalize(palavra);
      if (palavraNormalizada.length < 3) return false;
      const regex = new RegExp(`\\b${palavraNormalizada}\\b`, "i");
      const encontrou = regex.test(msgNormalizada);
      return encontrou;
    });

    function containsLink(text) {
      const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
      return linkRegex.test(text);
    }

    const temLink = bloquearLinks && containsLink(message.content);

    if (temPalavraProibida || temLink) {
      try {
        await message.delete();

        const aviso =
          guildData.moderacao.avisoPersonalizado ||
          "Sua mensagem foi removida por conter conteúdo proibido.";

        const sentMsg = await message.channel.send({
          content: `${message.author}, ${aviso}`,
          allowedMentions: { users: [message.author.id] },
        });

        setTimeout(() => {
          sentMsg.delete();
        }, 6000);
      } catch (err) {
        console.error("Erro ao moderar mensagem:", err);
      }
    }
  },
};
