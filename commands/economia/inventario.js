const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventario")
    .setDescription("Mostra seu inventário de itens"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const userData = await getUser(userId, guildId);

      if (!userData.inventario || userData.inventario.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0x95a5a6)
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTitle("📦 Inventário vazio")
          .setDescription("Você ainda não possui nenhum item no seu inventário.")
          .addFields({
            name: "💡 Dica",
            value: "Use `/loja` para ver itens disponíveis para compra!",
            inline: false,
          })
          .setFooter({
            text: "Nexus Bot • Economia • Inventário",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const agora = Date.now();
      
      // Separa itens por categoria
      const itensAtivos = [];
      const itensExpirados = [];
      const itensPermanentes = [];

      userData.inventario.forEach(item => {
        if (item.expiraEm && item.expiraEm <= agora) {
          itensExpirados.push(item);
        } else if (item.expiraEm) {
          itensAtivos.push(item);
        } else {
          itensPermanentes.push(item);
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("📦 Seu Inventário")
        .setDescription(`Você possui **${userData.inventario.length} itens** no total.`)
        .setThumbnail(interaction.client.user.displayAvatarURL());

      // Itens ativos (com tempo)
      if (itensAtivos.length > 0) {
        const itensAtivosTexto = itensAtivos.map(item => {
          const tempoRestante = item.expiraEm - agora;
          const horas = Math.floor(tempoRestante / (60 * 60 * 1000));
          const minutos = Math.floor((tempoRestante % (60 * 60 * 1000)) / (60 * 1000));
          
          return `${item.nome} - **${horas}h ${minutos}m restantes**`;
        }).join('\n');

        embed.addFields({
          name: "✅ Itens Ativos",
          value: itensAtivosTexto,
          inline: false,
        });
      }

      // Itens permanentes
      if (itensPermanentes.length > 0) {
        const itensPermanentesTexto = itensPermanentes.map(item => 
          `${item.nome} - **Permanente**`
        ).join('\n');

        embed.addFields({
          name: "🔒 Itens Permanentes",
          value: itensPermanentesTexto,
          inline: false,
        });
      }

      // Itens expirados
      if (itensExpirados.length > 0) {
        const itensExpiradosTexto = itensExpirados.map(item => 
          `~~${item.nome}~~ - **Expirado**`
        ).join('\n');

        embed.addFields({
          name: "⏰ Itens Expirados",
          value: itensExpiradosTexto,
          inline: false,
        });
      }

      // Estatísticas do inventário
      const totalItens = userData.inventario.length;
      const itensAtivosCount = itensAtivos.length;
      const itensPermanentesCount = itensPermanentes.length;
      const itensExpiradosCount = itensExpirados.length;

      embed.addFields({
        name: "📊 Estatísticas",
        value: `**Total:** ${totalItens}\n**Ativos:** ${itensAtivosCount}\n**Permanentes:** ${itensPermanentesCount}\n**Expirados:** ${itensExpiradosCount}`,
        inline: true,
      });

      // Status VIP
      if (userData.isPremium && userData.premiumEnd > agora) {
        const tempoVIP = userData.premiumEnd - agora;
        const diasVIP = Math.floor(tempoVIP / (24 * 60 * 60 * 1000));
        const horasVIP = Math.floor((tempoVIP % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        
        embed.addFields({
          name: "👑 Status VIP",
          value: `**Ativo** - ${diasVIP}d ${horasVIP}h restantes`,
          inline: true,
        });
      }

      // Boosts ativos
      const boosts = [];
      if (userData.xpBoost && userData.xpBoostEnd > agora) boosts.push("🚀 XP Boost");
      if (userData.moneyBoost && userData.moneyBoostEnd > agora) boosts.push("💰 Money Boost");
      if (userData.luckyCharm && userData.luckyCharmEnd > agora) boosts.push("🍀 Lucky Charm");
      if (userData.doubleDaily && userData.doubleDailyEnd > agora) boosts.push("📅 Double Daily");

      if (boosts.length > 0) {
        embed.addFields({
          name: "⚡ Boosts Ativos",
          value: boosts.join('\n'),
          inline: true,
        });
      }

      embed.setFooter({
        text: "Nexus Bot • Economia • Inventário",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /inventario:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao acessar o inventário. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
