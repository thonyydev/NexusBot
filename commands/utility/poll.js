const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("enquete")
    .setDescription("Crie uma enquete com opções para votação")
    .addStringOption((option) =>
      option
        .setName("pergunta")
        .setDescription("A pergunta da enquete")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("opcao1").setDescription("Opção 1").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("opcao2").setDescription("Opção 2").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("opcao3")
        .setDescription("Opção 3 (opcional)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("opcao4")
        .setDescription("Opção 4 (opcional)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("opcao5")
        .setDescription("Opção 5 (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const question = interaction.options.getString("pergunta");
    const options = [];

    // Pega as opções obrigatórias
    options.push(interaction.options.getString("opcao1"));
    options.push(interaction.options.getString("opcao2"));

    // Pega opções opcionais se preenchidas
    for (let i = 3; i <= 5; i++) {
      const opt = interaction.options.getString(`opcao${i}`);
      if (opt) options.push(opt);
    }

    // Cria botões para votar em cada opção
    const buttons = new ActionRowBuilder();
    options.forEach((opt, index) => {
      buttons.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_option_${index}`)
          .setLabel(opt)
          .setStyle(ButtonStyle.Primary)
      );
    });

    const embed = new EmbedBuilder()
      .setTitle("📊 Nova enquete")
      .setDescription(`**${question}**\n\nVote clicando nos botões abaixo!`)
      .setColor("#FFA500")
      .setFooter({ text: `Enquete criada por ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [buttons] });

    // Coletor de interações para os botões de votação
    const filter = (i) => i.customId.startsWith("poll_option_");
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 600000, // 10 minutos
    });

    // Map para contar votos (userId => optionIndex)
    const votes = new Map();

    collector.on("collect", async (i) => {
      if (votes.has(i.user.id)) {
        // Usuário já votou, atualiza voto
        votes.set(i.user.id, i.customId.split("_")[2]);
        await i.reply({ content: "✅ Voto atualizado!", ephemeral: true });
      } else {
        votes.set(i.user.id, i.customId.split("_")[2]);
        await i.reply({ content: "✅ Voto registrado!", ephemeral: true });
      }
    });

    collector.on("end", async () => {
      // Contar votos por opção
      const counts = new Array(options.length).fill(0);
      for (const vote of votes.values()) {
        counts[vote]++;
      }

      let resultText = "";
      options.forEach((opt, idx) => {
        resultText += `**${opt}** — ${counts[idx]} voto(s)\n`;
      });

      // Edita mensagem original com resultados finais
      const resultsEmbed = new EmbedBuilder()
        .setTitle("📊 Resultado da enquete")
        .setDescription(`**${question}**\n\n${resultText}`)
        .setColor("#FFA500")
        .setFooter({ text: "Enquete finalizada" })
        .setTimestamp();

      // Remove botões ao editar
      await interaction.editReply({ embeds: [resultsEmbed], components: [] });
    });
  },
};