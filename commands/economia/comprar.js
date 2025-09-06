const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comprar")
    .setDescription("Compra um item da loja")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("ID do item que você quer comprar")
        .setRequired(true)
        .addChoices(
          { name: "🎫 Passe VIP", value: "vip_pass" },
          { name: "🚀 Boost de XP", value: "xp_boost" },
          { name: "💰 Boost de Dinheiro", value: "money_boost" },
          { name: "🍀 Amuleto da Sorte", value: "lucky_charm" },
          { name: "📅 Daily Duplo", value: "double_daily" },
          { name: "⏭️ Pular Trabalho", value: "work_skip" },
          { name: "🎨 Mudar Cor", value: "color_change" },
          { name: "👑 Título Personalizado", value: "custom_title" }
        )
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const itemId = interaction.options.getString("item");

      const userData = await getUser(userId, guildId);

      // Itens disponíveis na loja
      const itens = {
        vip_pass: {
          nome: "🎫 Passe VIP",
          descricao: "Acesso a comandos exclusivos por 7 dias",
          preco: 5000,
          categoria: "Premium",
          emoji: "🎫",
          duracao: 7 * 24 * 60 * 60 * 1000 // 7 dias em ms
        },
        xp_boost: {
          nome: "🚀 Boost de XP",
          descricao: "2x XP por 24 horas",
          preco: 2000,
          categoria: "Boost",
          emoji: "🚀",
          duracao: 24 * 60 * 60 * 1000 // 24 horas em ms
        },
        money_boost: {
          nome: "💰 Boost de Dinheiro",
          descricao: "1.5x dinheiro do trabalho por 12 horas",
          preco: 1500,
          categoria: "Boost",
          emoji: "💰",
          duracao: 12 * 60 * 60 * 1000 // 12 horas em ms
        },
        lucky_charm: {
          nome: "🍀 Amuleto da Sorte",
          descricao: "Aumenta chances de eventos bons no trabalho",
          preco: 3000,
          categoria: "Especial",
          emoji: "🍀",
          duracao: 24 * 60 * 60 * 1000 // 24 horas em ms
        },
        double_daily: {
          nome: "📅 Daily Duplo",
          descricao: "Permite coletar daily duas vezes por dia",
          preco: 8000,
          categoria: "Especial",
          emoji: "📅",
          duracao: 24 * 60 * 60 * 1000 // 24 horas em ms
        },
        work_skip: {
          nome: "⏭️ Pular Trabalho",
          descricao: "Pula o cooldown do trabalho uma vez",
          preco: 1000,
          categoria: "Utilitário",
          emoji: "⏭️",
          duracao: null // Item de uso único
        },
        color_change: {
          nome: "🎨 Mudar Cor",
          descricao: "Permite personalizar a cor do seu perfil",
          preco: 500,
          categoria: "Cosmético",
          emoji: "🎨",
          duracao: null // Item permanente
        },
        custom_title: {
          nome: "👑 Título Personalizado",
          descricao: "Cria um título único para você",
          preco: 10000,
          categoria: "Cosmético",
          emoji: "👑",
          duracao: null // Item permanente
        }
      };

      const item = itens[itemId];

      if (!item) {
        return interaction.reply({
          content: "❌ Item não encontrado na loja.",
          ephemeral: true,
        });
      }

      if (userData.money < item.preco) {
        return interaction.reply({
          content: `❌ Saldo insuficiente! Você tem **${userData.money.toLocaleString("pt-BR")} Nexitos** e o item custa **${item.preco.toLocaleString("pt-BR")} Nexitos**.`,
          ephemeral: true,
        });
      }

      // Remove dinheiro da carteira
      userData.money -= item.preco;

      // Adiciona item ao inventário
      if (!userData.inventario) userData.inventario = [];
      
      const itemComprado = {
        id: itemId,
        nome: item.nome,
        categoria: item.categoria,
        compradoEm: Date.now(),
        ativo: true
      };

      // Se o item tem duração, adiciona data de expiração
      if (item.duracao) {
        itemComprado.expiraEm = Date.now() + item.duracao;
      }

      userData.inventario.push(itemComprado);

      // Aplica efeitos especiais baseados no item
      if (itemId === "vip_pass") {
        userData.isPremium = true;
        userData.premiumEnd = Date.now() + item.duracao;
      } else if (itemId === "xp_boost") {
        userData.xpBoost = true;
        userData.xpBoostEnd = Date.now() + item.duracao;
      } else if (itemId === "money_boost") {
        userData.moneyBoost = true;
        userData.moneyBoostEnd = Date.now() + item.duracao;
      } else if (itemId === "lucky_charm") {
        userData.luckyCharm = true;
        userData.luckyCharmEnd = Date.now() + item.duracao;
      } else if (itemId === "double_daily") {
        userData.doubleDaily = true;
        userData.doubleDailyEnd = Date.now() + item.duracao;
      }

      await userData.save();

      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setAuthor({
          name: `${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("🛒 Compra realizada!")
        .setDescription(`Você comprou **${item.nome}** com sucesso!`)
        .addFields(
          {
            name: "💰 Preço pago",
            value: `**${item.preco.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "🏦 Saldo restante",
            value: `**${userData.money.toLocaleString("pt-BR")} Nexitos**`,
            inline: true,
          },
          {
            name: "📦 Item adicionado",
            value: `${item.emoji} **${item.nome}**`,
            inline: true,
          }
        );

      // Adiciona informações específicas do item
      if (item.duracao) {
        const duracaoHoras = Math.floor(item.duracao / (60 * 60 * 1000));
        embed.addFields({
          name: "⏰ Duração",
          value: `**${duracaoHoras} horas**`,
          inline: true,
        });
      } else if (itemId === "work_skip") {
        embed.addFields({
          name: "💡 Como usar",
          value: "Use `/pular-trabalho` para pular o cooldown do trabalho uma vez!",
          inline: false,
        });
      } else if (itemId === "color_change") {
        embed.addFields({
          name: "💡 Como usar",
          value: "Use `/cor <cor>` para personalizar a cor do seu perfil!",
          inline: false,
        });
      } else if (itemId === "custom_title") {
        embed.addFields({
          name: "💡 Como usar",
          value: "Use `/titulo <texto>` para criar seu título personalizado!",
          inline: false,
        });
      }

      embed.setFooter({
        text: "Nexus Bot • Economia • Loja",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /comprar:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao processar a compra. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
