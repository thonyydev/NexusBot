const fetch = require("node-fetch"); // importe o fetch no Node.js

async function carregarPalavras() {
  const urls = [
    "https://raw.githubusercontent.com/DarkPizza/discord-automod-words/refs/heads/main/KeywordFilter01",
    "https://raw.githubusercontent.com/DarkPizza/discord-automod-words/refs/heads/main/KeywordFilter02",
  ];

  let todasPalavras = [];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erro ao buscar ${url}: ${res.status}`);

      const text = await res.text();
      // as palavras separadas por vírgula
      const palavras = text
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter((p) => p.length > 0);

      todasPalavras = todasPalavras.concat(palavras);
    } catch (err) {
      console.error(err);
    }
  }

  // Remove duplicadas
  todasPalavras = [...new Set(todasPalavras)];

  console.log(`Carregadas ${todasPalavras.length} palavras proibidas.`);
  return todasPalavras;
}

module.exports = { carregarPalavras };