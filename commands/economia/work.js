const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const getUser = require("../../utils/getUser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trabalhar")
    .setDescription("Realize um trabalho aleatório para ganhar Nexitos"),
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild?.id ?? null;

      const userData = await getUser(userId, guildId);

      function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const trabalhos = [
        {
          nome: "Programador",
          mensagens: [
            "Você corrigiu um bug crítico e salvou o sistema",
            "Você criou um app que viralizou",
            "Você trabalhou em um site para uma grande empresa",
          ],
          pagamento: { min: 200, max: 500 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Seu chefe ficou impressionado e te deu um bônus!",
              valor: { min: 50, max: 100 },
              chance: 0.3,
            },
            {
              tipo: "ruim",
              mensagem: "Você derramou café no computador e teve que pagar.",
              valor: { min: 20, max: 50 },
              chance: 0.2,
            },
          ],
        },
        {
          nome: "Cozinheiro",
          mensagens: [
            "Você fez um prato delicioso para um cliente famoso",
            "Você inventou uma receita nova que fez sucesso",
            "Você trabalhou num casamento e serviu 200 pessoas",
          ],
          pagamento: { min: 150, max: 400 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "O dono do restaurante te deu uma gorjeta extra!",
              valor: { min: 30, max: 80 },
              chance: 0.25,
            },
            {
              tipo: "ruim",
              mensagem: "Você queimou a comida e teve que pagar pelo prejuízo.",
              valor: { min: 10, max: 40 },
              chance: 0.15,
            },
          ],
        },
        {
          nome: "Motorista de Aplicativo",
          mensagens: [
            "Você fez várias corridas e atendeu passageiros simpáticos",
            "Você pegou um cliente que te deu 5 estrelas",
            "Você dirigiu o dia todo sem pegar trânsito",
          ],
          pagamento: { min: 100, max: 350 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Um passageiro te deu uma gorjeta generosa!",
              valor: { min: 20, max: 70 },
              chance: 0.3,
            },
            {
              tipo: "ruim",
              mensagem: "Seu carro quebrou e você gastou no conserto.",
              valor: { min: 30, max: 90 },
              chance: 0.2,
            },
          ],
        },
        {
          nome: "Streamer",
          mensagens: [
            "Sua live viralizou e você ganhou muitos seguidores",
            "Você transmitiu por horas e o chat te apoiou bastante",
            "Um clipe seu virou meme na internet",
          ],
          pagamento: { min: 180, max: 450 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Alguém fez uma doação gigante na sua live!",
              valor: { min: 50, max: 150 },
              chance: 0.25,
            },
            {
              tipo: "ruim",
              mensagem:
                "Sua internet caiu no meio da live e você perdeu inscritos.",
              valor: { min: 20, max: 80 },
              chance: 0.15,
            },
          ],
        },
        {
          nome: "Padeiro",
          mensagens: [
            "Você fez pães quentinhos que esgotaram em minutos",
            "Você preparou um bolo delicioso para um aniversário",
            "Você inventou um novo sabor de pão que fez sucesso",
          ],
          pagamento: { min: 120, max: 300 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Um cliente encomendou uma fornada enorme!",
              valor: { min: 40, max: 90 },
              chance: 0.3,
            },
            {
              tipo: "ruim",
              mensagem: "Você queimou uma fornada inteira e teve prejuízo.",
              valor: { min: 15, max: 50 },
              chance: 0.2,
            },
          ],
        },
        {
          nome: "Fotógrafo",
          mensagens: [
            "Você fez um ensaio para um casamento",
            "Você fotografou a natureza e vendeu as imagens",
            "Suas fotos foram publicadas em uma revista",
          ],
          pagamento: { min: 160, max: 420 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Uma de suas fotos foi vendida por um preço altíssimo!",
              valor: { min: 60, max: 120 },
              chance: 0.25,
            },
            {
              tipo: "ruim",
              mensagem: "Você derrubou a câmera e precisou pagar o conserto.",
              valor: { min: 30, max: 100 },
              chance: 0.15,
            },
          ],
        },
        {
          nome: "DJ",
          mensagens: [
            "Você animou uma festa incrível e todo mundo dançou",
            "Você tocou em um festival local",
            "Você fez um remix que viralizou nas redes sociais",
          ],
          pagamento: { min: 200, max: 550 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Um fã rico te pagou para tocar em uma festa privada.",
              valor: { min: 80, max: 150 },
              chance: 0.25,
            },
            {
              tipo: "ruim",
              mensagem: "Seu equipamento quebrou no meio da festa.",
              valor: { min: 50, max: 120 },
              chance: 0.15,
            },
          ],
        },
        {
          nome: "Mecânico",
          mensagens: [
            "Você consertou um carro antigo e ele ficou como novo",
            "Você fez manutenção em uma frota de veículos",
            "Você trocou peças rapidamente e impressionou o cliente",
          ],
          pagamento: { min: 150, max: 380 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "O cliente te pagou um extra pelo ótimo serviço.",
              valor: { min: 40, max: 100 },
              chance: 0.3,
            },
            {
              tipo: "ruim",
              mensagem: "Você comprou uma peça errada e teve prejuízo.",
              valor: { min: 20, max: 70 },
              chance: 0.2,
            },
          ],
        },
        {
          nome: "Youtuber",
          mensagens: [
            "Seu vídeo bateu recorde de visualizações",
            "Você fechou parceria com uma marca",
            "Você gravou um vídeo que virou meme",
          ],
          pagamento: { min: 180, max: 480 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Uma marca fez uma grande doação!",
              valor: { min: 70, max: 140 },
              chance: 0.25,
            },
            {
              tipo: "ruim",
              mensagem: "Seu vídeo recebeu strike e perdeu monetização.",
              valor: { min: 30, max: 90 },
              chance: 0.15,
            },
          ],
        },
        {
          nome: "Astronauta",
          mensagens: [
            "Você ajudou a consertar um satélite no espaço",
            "Você tirou fotos da Terra que viraram notícia",
            "Você fez experimentos científicos na ISS",
          ],
          pagamento: { min: 400, max: 800 },
          eventos: [
            {
              tipo: "bom",
              mensagem: "Descoberta científica trouxe reconhecimento e bônus.",
              valor: { min: 100, max: 200 },
              chance: 0.2,
            },
            {
              tipo: "ruim",
              mensagem: "Pequeno acidente causou danos no equipamento.",
              valor: { min: 80, max: 150 },
              chance: 0.1,
            },
          ],
        },
      ];

      if (userData.workCooldown && Date.now() < userData.workCooldown) {
        const cooldownTimestamp = Math.floor(userData.workCooldown / 1000); // segundos UNIX

        const cooldownEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle("⏳ Cooldown ativo")
          .setDescription(
            "Você já trabalhou recentemente — espere um pouco antes de tentar de novo."
          )
          .addFields(
            {
              name: "🔁 Disponível em:",
              value: `<t:${cooldownTimestamp}:F>`,
              inline: false,
            },
            {
              name: "⏱️ Tempo restante:",
              value: `<t:${cooldownTimestamp}:R>`,
              inline: false,
            }
          )
          .setFooter({
            text: "Nexus Bot • Economia",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
      }

      const trabalhoEscolhido = trabalhos[random(0, trabalhos.length - 1)];
      const mensagemBase =
        trabalhoEscolhido.mensagens[
          random(0, trabalhoEscolhido.mensagens.length - 1)
        ];

      const pagamentoBase = random(
        trabalhoEscolhido.pagamento.min,
        trabalhoEscolhido.pagamento.max
      );

      const evento = trabalhoEscolhido.eventos?.find(
        (e) => Math.random() < e.chance
      );
      let valorEvento = 0;
      let textoEvento = "Nenhum evento extra";
      if (evento) {
        valorEvento = random(evento.valor.min, evento.valor.max);
        textoEvento = `${evento.mensagem} (${
          evento.tipo === "bom" ? "+" : "-"
        }${valorEvento} Nexitos)`;
      }

      const totalRecebido =
        pagamentoBase +
        (evento ? (evento.tipo === "bom" ? valorEvento : -valorEvento) : 0);

      const cooldownMs = random(2 * 60 * 60 * 1000, 4 * 60 * 60 * 1000);
      userData.lastWork = Date.now();
      userData.workCooldown = Date.now() + cooldownMs;
      userData.money = (userData.money || 0) + totalRecebido;
      if (typeof userData.save === "function") await userData.save();

      const ganhoFormatado = `${Math.abs(totalRecebido).toLocaleString(
        "pt-BR"
      )} Nexitos`;
      const pagamentoBaseFormatado = `${pagamentoBase.toLocaleString(
        "pt-BR"
      )} Nexitos`;
      const saldoAtualFormatado = `${userData.money.toLocaleString(
        "pt-BR"
      )} Nexitos`;
      const cooldownTimestamp = Math.floor(userData.workCooldown / 1000);
      const proximoTrabalhoRelativo = `<t:${cooldownTimestamp}:R>`;
      const proximoTrabalhoAbsoluto = `<t:${cooldownTimestamp}:f>`;

      let corEmbed = 0x1abc9c;
      if (evento) {
        if (evento.tipo === "bom") corEmbed = 0x2ecc71;
        if (evento.tipo === "ruim") corEmbed = 0xe74c3c;
      }

      const emojiMap = {
        Programador: "💻",
        Cozinheiro: "🍳",
        "Motorista de Aplicativo": "🚗",
        Streamer: "📺",
        Padeiro: "🥐",
        Fotógrafo: "📸",
        DJ: "🎧",
        Mecânico: "🔧",
        Youtuber: "🎬",
        Astronauta: "🧑‍🚀",
      };
      const trabalhoEmoji = emojiMap[trabalhoEscolhido.nome] ?? "💼";

      const embed = new EmbedBuilder()
        .setColor(corEmbed)
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(
          `${trabalhoEmoji} Trabalho concluído — ${trabalhoEscolhido.nome}`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(
          `**${mensagemBase}**\n\nVocê ${
            totalRecebido >= 0 ? "recebeu" : "perdeu"
          } **${ganhoFormatado}**`
        )
        .addFields(
          {
            name: "💰 Pagamento base",
            value: pagamentoBaseFormatado,
            inline: true,
          },
          { name: "✨ Evento", value: textoEvento, inline: true },
          { name: "🏦 Saldo atual", value: saldoAtualFormatado, inline: true },
          {
            name: "⏱️ Próximo trabalho",
            value: `${proximoTrabalhoRelativo} (${proximoTrabalhoAbsoluto})`,
            inline: false,
          }
        )
        .setFooter({
          text: "Nexus Bot • Economia",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Erro no comando /trabalhar:", err);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Erro")
        .setDescription(
          "Ocorreu um erro ao realizar o trabalho. Tente novamente mais tarde."
        )
        .setTimestamp();
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};