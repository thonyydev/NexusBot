const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Mostra o saldo do usuário"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const userData = await getUser(userId, guildId);
      // fallback seguro para carteira e banco
      const money = Number(userData?.money ?? 0);
      const bank = Number(userData?.bank ?? 0);

      // resenha baseada só no saldo da carteira
      let resenha = "";
      if (money === 0) {
        resenha = "Rapaz... tá zerado 🥲 Vai trabalhar que tá feio.";
      } else if (money < 100) {
        resenha = "Dá pra comprar um chiclete e olhe lá 😅";
      } else if (money < 500) {
        resenha = "Tá começando a vida, jovem padawan 🧘";
      } else if (money < 1000) {
        resenha = "Já dá pra levar um date no Habib’s 😎";
      } else if (money < 3000) {
        resenha = "Tu tá bem na fita! 💵";
      } else if (money < 10000) {
        resenha = "Empresário(a) do Discord detected 🧳📈";
      } else if (money < 50000) {
        resenha = "Mais rico que o dono da Havan 🏢🇧🇷";
      } else {
        resenha =
          "BANCO CENTRAL do servidor 💸🔥 Tu que imprime o dinheiro, né?";
      }

      const moedaText = money === 1 ? "Nexito" : "Nexitos";
      const moedaBankText = bank === 1 ? "Nexito" : "Nexitos";

      const moneyFormatted = money.toLocaleString("pt-BR");
      const bankFormatted = bank.toLocaleString("pt-BR");

      const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("🏦 Saldo")
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(
          `Aqui está o seu saldo, ${interaction.user.username}!`
        )
        .addFields(
          {
            name: "💰 Carteira",
            value: `**${moneyFormatted} ${moedaText}**`,
            inline: true,
          },
          {
            name: "📝 Status",
            value: `${resenha}`,
            inline: false,
          },
          {
            name: "🏦 Banco",
            value: `**${bankFormatted} ${moedaBankText}**`,
            inline: true,
          }
        )
        .setFooter({
          text: "Nexus Bot • Economia",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error("Erro no /saldo:", err);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Erro")
        .setDescription(
          "Não consegui obter seu saldo no momento. Tente novamente mais tarde."
        )
        .setTimestamp();
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
