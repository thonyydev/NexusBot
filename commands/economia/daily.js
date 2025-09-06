const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const User = require("../../models/User");

const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Resgata seu bônus diário de economia"),
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const userData = await getUser(userId, guildId);

    // Calcula valor aleatório entre 50 e 150
    const valorDaily = Math.floor(Math.random() * 101) + 50;

    const agora = Date.now();
    const umDia = 24 * 60 * 60 * 1000; // 86400000 ms

    // Se nunca pegou ou já passou 24h desde o último daily
    if (!userData.lastDaily || agora - userData.lastDaily >= umDia) {
      userData.lastDaily = agora;
      userData.money += valorDaily;
      await userData.save();

      return interaction.reply({
        content: `🤑 Tá rico, hein?! Recompensa diária liberada! Você recebeu **${valorDaily} Nexitos**, seu novo saldo agora é **${userData.money} Nexitos**!`,
      });
    }

    // Se ainda não completou 24h
    const tempoRestante = umDia - (agora - userData.lastDaily);
    const horas = Math.floor(tempoRestante / (60 * 60 * 1000));
    const minutos = Math.floor(
      (tempoRestante % (60 * 60 * 1000)) / (60 * 1000)
    );

    return interaction.reply({
      content: `⏳ Calma, irmão! Tá querendo passar a perna igual Golpe do Pix? Volta só daqui a **${horas}h ${minutos}m**! 😂`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
