const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },

    // Canais configurados
    welcomeChannel: { type: String, default: null },
    leaveChannel: { type: String, default: null },
    logChannel: { type: String, default: null },
    modLogChannel: { type: String, default: null },

    // Cargos
    muteRole: { type: String, default: null },
    adminRole: { type: String, default: null },

    // Mensagens personalizadas
    welcomeMessage: { type: String, default: "Seja bem-vindo(a), {user}!" },
    leaveMessage: { type: String, default: "{user} saiu do servidor 😢" },

    // Sistemas ativados
    sistemas: {
      economia: { type: Boolean, default: true },
      moderacao: { type: Boolean, default: true },
      autoMod: { type: Boolean, default: false },
      mensagensBoasVindas: { type: Boolean, default: true },
    },

    // Dentro do schema Guild
    moderacao: {
      ativa: { type: Boolean, default: false },
      bloquearLinks: { type: Boolean, default: false },
      avisoPersonalizado: {
        type: String,
        default: "Sua mensagem foi removida por conter conteúdo proibido.",
      },
    },

    // Comandos desativados
    comandosDesativados: { type: [String], default: [] },

    // Idioma (caso você queira multi-idioma no futuro)
    language: { type: String, default: "pt-BR" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guild", guildSchema);
