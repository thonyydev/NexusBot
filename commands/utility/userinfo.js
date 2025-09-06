const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Mostra informações sobre um usuário")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("O usuário para ver as informações")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("usuário") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const createdAt = Math.floor(user.createdTimestamp / 1000);
    const joinedAt = member ? Math.floor(member.joinedTimestamp / 1000) : null;

    const embed = new EmbedBuilder()
      .setTitle(`👤 Informações de ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor("#FFA500")
      .addFields(
        { name: "🆔 ID", value: user.id, inline: true },
        {
          name: "📝 Apelido",
          value: member ? member.nickname ?? "Nenhum" : "Não está no servidor",
          inline: true,
        },
        {
          name: "📅 Conta criada em",
          value: `<t:${createdAt}:D> (<t:${createdAt}:R>)`,
          inline: true,
        },
        {
          name: "🚪 Entrou no servidor em",
          value: joinedAt
            ? `<t:${joinedAt}:D> (<t:${joinedAt}:R>)`
            : "Não está no servidor",
          inline: true,
        },
        {
          name: "🤖 Bot?",
          value: user.bot ? "Sim 🤖" : "Não",
          inline: true,
        },
        {
          name: "🟢 Status",
          value: member ? member.presence?.status ?? "Offline" : "Desconhecido",
          inline: true,
        }
      )
      .setFooter({
        text: "Nexus Bot • User Info",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};