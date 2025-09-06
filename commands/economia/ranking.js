const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Mostra o ranking dos usuários mais ricos do servidor")
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de ranking")
        .setRequired(false)
        .addChoices(
          { name: "💰 Dinheiro na carteira", value: "money" },
          { name: "🏦 Dinheiro no banco", value: "bank" },
          { name: "💎 Total (carteira + banco)", value: "total" },
          { name: "📊 Trabalhos realizados", value: "work" }
        )
    ),

  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const tipo = interaction.options.getString("tipo") || "total";

      // Busca usuários do servidor
      const usuarios = await User.find({ guildId: guildId }).sort({ money: -1, bank: -1 }).limit(10);

      if (usuarios.length === 0) {
        return interaction.reply({
          content: "❌ Nenhum usuário encontrado neste servidor.",
          ephemeral: true,
        });
      }

      // Ordena baseado no tipo selecionado
      let usuariosOrdenados = [...usuarios];
      if (tipo === "money") {
        usuariosOrdenados.sort((a, b) => (b.money || 0) - (a.money || 0));
      } else if (tipo === "bank") {
        usuariosOrdenados.sort((a, b) => (b.bank || 0) - (a.bank || 0));
      } else if (tipo === "total") {
        usuariosOrdenados.sort((a, b) => ((b.money || 0) + (b.bank || 0)) - ((a.money || 0) + (a.bank || 0)));
      }

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("🏆 Ranking de Riqueza")
        .setDescription(`Top 10 usuários mais ricos do servidor`)
        .setThumbnail(interaction.client.user.displayAvatarURL());

      // Adiciona campo com o tipo de ranking
      const tiposRanking = {
        money: "💰 Dinheiro na carteira",
        bank: "🏦 Dinheiro no banco", 
        total: "💎 Total (carteira + banco)",
        work: "📊 Trabalhos realizados"
      };

      embed.addFields({
        name: "📊 Tipo de Ranking",
        value: tiposRanking[tipo],
        inline: false,
      });

      // Gera o ranking
      let rankingTexto = "";
      for (let i = 0; i < Math.min(usuariosOrdenados.length, 10); i++) {
        const usuario = usuariosOrdenados[i];
        const posicao = i + 1;
        
        // Emojis para as posições
        let emoji = "";
        if (posicao === 1) emoji = "🥇";
        else if (posicao === 2) emoji = "🥈";
        else if (posicao === 3) emoji = "🥉";
        else emoji = `${posicao}.`;

        // Busca informações do usuário no Discord
        let username = "Usuário desconhecido";
        let avatar = interaction.client.user.displayAvatarURL();
        
        try {
          const discordUser = await interaction.client.users.fetch(usuario.userId);
          username = discordUser.username;
          avatar = discordUser.displayAvatarURL();
        } catch (error) {
          console.log(`Usuário ${usuario.userId} não encontrado`);
        }

        // Calcula o valor baseado no tipo
        let valor = 0;
        if (tipo === "money") {
          valor = usuario.money || 0;
        } else if (tipo === "bank") {
          valor = usuario.bank || 0;
        } else if (tipo === "total") {
          valor = (usuario.money || 0) + (usuario.bank || 0);
        }

        // Formata o valor
        const valorFormatado = valor.toLocaleString("pt-BR");
        
        rankingTexto += `${emoji} **${username}** - **${valorFormatado} Nexitos**\n`;
      }

      embed.addFields({
        name: "🏅 Ranking",
        value: rankingTexto,
        inline: false,
      });

      // Adiciona estatísticas gerais
      const totalUsuarios = usuarios.length;
      const totalDinheiro = usuarios.reduce((sum, user) => sum + (user.money || 0), 0);
      const totalBanco = usuarios.reduce((sum, user) => sum + (user.bank || 0), 0);
      const mediaDinheiro = Math.floor(totalDinheiro / totalUsuarios);
      const mediaBanco = Math.floor(totalBanco / totalUsuarios);

      embed.addFields({
        name: "📈 Estatísticas do Servidor",
        value: `**Total de usuários:** ${totalUsuarios}\n**Dinheiro total:** ${totalDinheiro.toLocaleString("pt-BR")} Nexitos\n**Média por usuário:** ${mediaDinheiro.toLocaleString("pt-BR")} Nexitos`,
        inline: true,
      });

      // Adiciona informações sobre o usuário atual
      const usuarioAtual = usuarios.find(u => u.userId === interaction.user.id);
      if (usuarioAtual) {
        const posicaoAtual = usuariosOrdenados.findIndex(u => u.userId === interaction.user.id) + 1;
        const valorAtual = tipo === "money" ? (usuarioAtual.money || 0) : 
                          tipo === "bank" ? (usuarioAtual.bank || 0) : 
                          (usuarioAtual.money || 0) + (usuarioAtual.bank || 0);

        embed.addFields({
          name: "👤 Sua Posição",
          value: `**Posição:** ${posicaoAtual}º\n**Valor:** ${valorAtual.toLocaleString("pt-BR")} Nexitos`,
          inline: true,
        });
      }

      embed.setFooter({
        text: "Nexus Bot • Economia • Ranking",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro no /ranking:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao gerar o ranking. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};
