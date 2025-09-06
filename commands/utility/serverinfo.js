const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Mostra informações sobre o servidor atual"),
  async execute(interaction) {
    const { guild } = interaction;

    // Contagem de bots no servidor
    const botsCount = guild.members.cache.filter(
      (member) => member.user.bot
    ).size;
    // Canais categorizados
    const textChannels = guild.channels.cache.filter(
      (ch) => ch.type === 0
    ).size; // GuildText = 0
    const voiceChannels = guild.channels.cache.filter(
      (ch) => ch.type === 2
    ).size; // GuildVoice = 2
    const categories = guild.channels.cache.filter((ch) => ch.type === 4).size; // Category = 4

    // Número de emojis
    const emojiCount = guild.emojis.cache.size;
    // Número de cargos
    const rolesCount = guild.roles.cache.size;

    // Nível de verificação
    const verificationLevels = {
      0: "Nenhuma",
      1: "Baixa",
      2: "Média",
      3: "Alta",
      4: "Muito alta",
    };
    const verificationLevel =
      verificationLevels[guild.verificationLevel] || "Desconhecido";

    // Boost info
    const boostCount = guild.premiumSubscriptionCount || 0;
    const boostTier =
      ["Nenhum", "Nível 1", "Nível 2", "Nível 3"][guild.premiumTier] ||
      "Nenhum";

    const embed = new EmbedBuilder()
      .setTitle(`🏰 Informações do servidor: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .setColor("#FFA500")
      .addFields(
        { name: "🆔 ID", value: guild.id, inline: true },
        { name: "👑 Dono", value: `<@${guild.ownerId}>`, inline: true },
        {
          name: "🌐 Região / Idioma",
          value: guild.preferredLocale || "Não definido",
          inline: true,
        },

        { name: "👥 Membros", value: `${guild.memberCount}`, inline: true },
        { name: "🤖 Bots", value: `${botsCount}`, inline: true },
        { name: "💬 Canais de texto", value: `${textChannels}`, inline: true },
        { name: "🔊 Canais de voz", value: `${voiceChannels}`, inline: true },
        { name: "📂 Categorias", value: `${categories}`, inline: true },

        { name: "🎭 Emojis", value: `${emojiCount}`, inline: true },
        { name: "🔰 Cargos", value: `${rolesCount}`, inline: true },

        {
          name: "🛡️ Nível de verificação",
          value: verificationLevel,
          inline: true,
        },
        {
          name: "🚀 Boosts",
          value: `${boostCount} (${boostTier})`,
          inline: true,
        },

        {
          name: "📅 Criado em",
          value: `<t:${Math.floor(
            guild.createdTimestamp / 1000
          )}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`,
          inline: true,
        }
      )
      .setFooter({
        text: "Nexus Bot • Server Info",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};