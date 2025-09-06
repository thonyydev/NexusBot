const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Recria o canal para limpar todas as mensagens (perigoso!)")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;

    if (
      !channel
        .permissionsFor(interaction.guild.members.me)
        .has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return interaction.reply({
        content:
          "❌ Eu preciso da permissão 'Gerenciar Canais' para fazer isso.",
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor("#faa61a")
      .setTitle("Confirmação de Nuke")
      .setDescription(
        `Você tem certeza que quer **recriar** o canal **${channel.name}**? Isso vai apagar **todas as mensagens** e configurar um canal **idêntico**.\n\nClique em **Confirmar** daqui 8 segundos para prosseguir ou **Cancelar** para abortar.`
      )
      .setFooter({ text: "Essa ação é irreversível!" });

    // Botões: Confirmar desabilitado, Cancelar habilitado
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_nuke")
        .setLabel("Confirmar")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true), // desabilitado inicialmente
      new ButtonBuilder()
        .setCustomId("cancel_nuke")
        .setLabel("Cancelar")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)
    );

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [buttons],
      ephemeral: true,
    });

    // Após 8 segundos, habilita o botão Confirmar
    setTimeout(async () => {
      const enableButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_nuke")
          .setLabel("Confirmar")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId("cancel_nuke")
          .setLabel("Cancelar")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(false)
      );

      // Edita a mensagem para atualizar os botões
      await interaction.editReply({ components: [enableButtons] });
    }, 8000);

    const filter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await interaction.channel.awaitMessageComponent({
        filter,
        componentType: ComponentType.Button,
        time: 30000,
      });

      if (confirmation.customId === "confirm_nuke") {
        // Aqui fazemos deferReply para ganhar tempo
        await confirmation.deferReply({ ephemeral: true });

        const clone = await channel.clone();
        await clone.setPosition(channel.position);
        await channel.delete();

        // Como o canal original foi deletado, não dá pra editar a resposta original
        // Então respondemos no novo canal diretamente
        await confirmation.followUp({
          content: `💥 Canal **${clone.name}** recriado com sucesso!`,
          ephemeral: true,
        });
      } else if (confirmation.customId === "cancel_nuke") {
        await confirmation.update({
          content: "❌ Ação de nuke cancelada.",
          components: [],
          embeds: [],
        });
      }
    } catch (error) {
      // Se o tempo esgotar, só edite a mensagem da interação original
      try {
        await interaction.editReply({
          content: "⏰ Tempo esgotado. Comando cancelado.",
          components: [],
          embeds: [],
        });
      } catch {
        // Se a mensagem já foi removida, não faça nada
      }
    }
  },
};