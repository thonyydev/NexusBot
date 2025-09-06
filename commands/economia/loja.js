const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loja")
    .setDescription("Acessa a loja do servidor"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const userData = await getUser(userId, guildId);

      // Itens disponíveis na loja
      const itens = [
        {
          id: "vip_pass",
          nome: "🎫 Passe VIP",
          descricao: "Acesso a comandos exclusivos por 7 dias",
          preco: 5000,
          categoria: "Premium",
          emoji: "🎫"
        },
        {
          id: "xp_boost",
          nome: "🚀 Boost de XP",
          descricao: "2x XP por 24 horas",
          preco: 2000,
          categoria: "Boost",
          emoji: "🚀"
        },
        {
          id: "money_boost",
          nome: "💰 Boost de Dinheiro",
          descricao: "1.5x dinheiro do trabalho por 12 horas",
          preco: 1500,
          categoria: "Boost",
          emoji: "💰"
        },
        {
          id: "lucky_charm",
          nome: "🍀 Amuleto da Sorte",
          descricao: "Aumenta chances de eventos bons no trabalho",
          preco: 3000,
          categoria: "Especial",
          emoji: "🍀"
        },
        {
          id: "double_daily",
          nome: "📅 Daily Duplo",
          descricao: "Permite coletar daily duas vezes por dia",
          preco: 8000,
          categoria: "Especial",
          emoji: "📅"
        },
        {
          id: "work_skip",
          nome: "⏭️ Pular Trabalho",
          descricao: "Pula o cooldown do trabalho uma vez",
          preco: 1000,
          categoria: "Utilitário",
          emoji: "⏭️"
        },
        {
          id: "color_change",
          nome: "🎨 Mudar Cor",
          descricao: "Permite personalizar a cor do seu perfil",
          preco: 500,
          categoria: "Cosmético",
          emoji: "🎨"
        },
        {
          id: "custom_title",
          nome: "👑 Título Personalizado",
          descricao: "Cria um título único para você",
          preco: 10000,
          categoria: "Cosmético",
          emoji: "👑"
        }
      ];

      // Agrupa itens por categoria
      const categorias = {};
      itens.forEach(item => {
        if (!categorias[item.categoria]) {
          categorias[item.categoria] = [];
        }
        categorias[item.categoria].push(item);
      });

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("🛒 Loja do Nexus")
        .setDescription(`Bem-vindo à loja! Seu saldo: **${userData.money.toLocaleString("pt-BR")} Nexitos**`)
        .setThumbnail(interaction.client.user.displayAvatarURL());

      // Adiciona campos para cada categoria
      Object.entries(categorias).forEach(([categoria, itensCategoria]) => {
        const itensTexto = itensCategoria.map(item => 
          `${item.emoji} **${item.nome}** - ${item.preco.toLocaleString("pt-BR")} Nexitos\n└ ${item.descricao}`
        ).join('\n\n');

        embed.addFields({
          name: `${categoria}`,
          value: itensTexto,
          inline: false,
        });
      });

      embed.addFields({
        name: "💡 Como comprar",
        value: "Use `/comprar <item>` para comprar um item específico da loja!",
        inline: false,
      });

      embed.setFooter({
        text: "Nexus Bot • Economia • Loja",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /loja:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao acessar a loja. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
