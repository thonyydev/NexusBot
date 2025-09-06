const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Guild = require("../../models/Guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modconfig")
    .setDescription("Configura a moderação do servidor")
    .addBooleanOption((option) =>
      option
        .setName("ativa")
        .setDescription("Ativar ou desativar a moderação")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("bloquearlinks")
        .setDescription("Bloquear links nas mensagens")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("avisopersonalizado")
        .setDescription("Mensagem personalizada para aviso")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has("ManageGuild")) {
      return interaction.reply({
        content:
          "Você precisa da permissão **Gerenciar Servidor** para usar este comando.",
        ephemeral: true,
      });
    }

    const ativa = interaction.options.getBoolean("ativa");
    const bloquearLinks = interaction.options.getBoolean("bloquearlinks");
    const avisoPersonalizado =
      interaction.options.getString("avisopersonalizado");

    let guildData = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildData) {
      guildData = new Guild({ guildId: interaction.guild.id });
    }

    guildData.moderacao = guildData.moderacao || {};
    guildData.moderacao.ativa = ativa;
    if (bloquearLinks !== null)
      guildData.moderacao.bloquearLinks = bloquearLinks;
    if (avisoPersonalizado !== null && avisoPersonalizado.trim().length > 0) {
      guildData.moderacao.avisoPersonalizado = avisoPersonalizado.trim();
    } else if (avisoPersonalizado === null) {
      // não altera
    } else {
      guildData.moderacao.avisoPersonalizado = undefined;
    }

    await guildData.save();

    const embed = new EmbedBuilder()
      .setTitle("Configuração de Moderação Atualizada")
      .setColor("#5865F2")
      .addFields(
        {
          name: "Moderação",
          value: ativa ? "🟢 Ativada" : "🔴 Desativada",
          inline: true,
        },
        {
          name: "Bloqueio de Links",
          value:
            bloquearLinks !== null
              ? bloquearLinks
                ? "🟢 Ativado"
                : "🔴 Desativado"
              : "⚪ Não alterado",
          inline: true,
        },
        {
          name: "Aviso Personalizado",
          value:
            avisoPersonalizado !== null
              ? avisoPersonalizado.trim().length > 0
                ? `📢 \`${avisoPersonalizado}\``
                : "❌ Removido"
              : "⚪ Não alterado",
          inline: false,
        }
      )
      .setFooter({
        text: `Configuração realizada por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};