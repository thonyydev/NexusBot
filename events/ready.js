const { Events, ActivityType } = require("discord.js");

const Status = [
  { name: "/help – salva até casamento 💍", type: ActivityType.Listening },
  {
    name: "📋 Use /comandos e vire um mestre dos bots!",
    type: ActivityType.Playing,
  },
  {
    name: "📦 Caixa de sugestões aberta! /sugerir",
    type: ActivityType.Listening,
  },
  {
    name: "💸 Tá duro? Vem farmar com /trabalhar",
    type: ActivityType.Watching,
  },
  {
    name: "🕵️ Investigando os causadores de caos...",
    type: ActivityType.Watching,
  },
  {
    name: "🎁 Já resgatou seu bônus hoje? /diario",
    type: ActivityType.Playing,
  },
  {
    name: "📊 Economia do server em tempo real 💹",
    type: ActivityType.Watching,
  },
  {
    name: "😎 De olho em quem curte dar uma trollada...",
    type: ActivityType.Watching,
  },
  { name: '👀 Alguém aí falou "admin"?', type: ActivityType.Watching },
  {
    name: "🛠️ Sempre pronto pra moderar na paz (ou na treta)",
    type: ActivityType.Competing,
  },
  {
    name: "📚 Aprendendo novos comandos pra te ajudar mais 😄",
    type: ActivityType.Playing,
  },
  {
    name: "🧠 Eu penso, logo eu bano (se precisar 😜)",
    type: ActivityType.Watching,
  },
  {
    name: "💬 Respondo até “salve”! Me chama aí",
    type: ActivityType.Listening,
  },
  {
    name: "🔧 Otimizando tudo nos bastidores... tipo ninja 🥷",
    type: ActivityType.Playing,
  },
];

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Tudo pronto! Logado como ${client.user.tag}`);

    let i = 0;

    setInterval(() => {
      const status = Status[i % Status.length];
      client.user.setActivity(status.name, { type: status.type });
      i++;
    }, 10_000);
  },
};
