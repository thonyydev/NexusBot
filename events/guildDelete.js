const Guild = require("../models/Guild");

module.exports = {
  name: "guildDelete",
  once: false,
  async execute(guild) {
    try {
      await Guild.deleteOne({ guildId: guild.id });
      console.log(
        `Dados do servidor ${guild.name} (${guild.id}) removidos do banco.`
      );
    } catch (error) {
      console.error("Erro ao remover dados no guildDelete:", error);
    }
  },
};