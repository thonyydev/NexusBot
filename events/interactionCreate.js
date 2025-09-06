const { Events, MessageFlags, Client, GatewayIntentBits, Message } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `Nenhum comando encontrado com o nome: ${interaction.commandName}`
      );
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Erro ao executar o comando ${interaction.commandName}:`,
        error
      );
      await interaction.reply({
        content: "Houve um erro ao tentar executar esse comando.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
