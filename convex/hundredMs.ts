"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import jwt from "jsonwebtoken";

export const generate100msToken = action({
  args: {
    roomId: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    void ctx;
    const accessKey = process.env.HMS_ACCESS_KEY;
    const secret = process.env.HMS_SECRET;

    if (!accessKey || !secret) {
      throw new Error("HMS_ACCESS_KEY or HMS_SECRET is not configured");
    }

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      access_key: accessKey,
      room_id: args.roomId,
      user_id: args.userName,
      role: "guest",
      type: "app",
      version: 2,
      iat: now,
      exp: now + 60 * 60 * 24,
      jti: args.userName + "-" + now,
    };

    const token = jwt.sign(payload, secret, {
      algorithm: "HS256",
    });

    return token;
  },
});

