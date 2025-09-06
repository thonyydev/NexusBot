const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true, unique: true },

    // Economia
    money: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    dailyClaimed: { type: Boolean, default: false },
    workCooldown: { type: Date, default: null },

    // Cooldowns
    lastDaily: { type: Date, default: null },
    lastWork: { type: Date, default: null },

    // Premium
    isPremium: { type: Boolean, default: false },
    premiumEnd: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);