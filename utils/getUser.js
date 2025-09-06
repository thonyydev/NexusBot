const User = require("../models/User");


async function getOrCreateUser(userId, guildId) {
  let user = await User.findOneAndUpdate({ userId, guildId });

  if (!user) {
    user = new User({ userId, guildId });
    await user.save();
  }

  return user;
}

module.exports = getOrCreateUser;