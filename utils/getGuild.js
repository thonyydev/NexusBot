const Guild = require("../models/Guild");

async function getOrCreateGuild(guildId) {
  let guild = await Guild.findOneAndUpdate({ guildId });

  if (!guild) {
    guild = new Guild({ guildId });
    await guild.save();
  }

  return guild;
}

module.exports = getOrCreateGuild;