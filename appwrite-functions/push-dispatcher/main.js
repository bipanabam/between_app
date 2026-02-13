import { Client, Databases, ID, Query } from "node-appwrite";

export default async ({ req, res, error, log }) => {
  try {
    if (!req.body) {
      return res.json({ ok: false, error: "Missing body" }, 400);
    }

    const payload = JSON.parse(req.body);

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);
    const DB = process.env.DB_ID;

    // helper
    const sendExpoPush = async (token, title, body, data, badge) => {
      if (!token) return;

      const r = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: token,
          title,
          body,
          data,
          sound: "default",
          priority: "high",
          badge,
        }),
      });

      const j = await r.json();

      if (j.data?.[0]?.status === "error") {
        if (j.data[0].details?.error === "DeviceNotRegistered") {
          log("invalid token:- clearing");
        }
      }
    };

    // MESSAGE PUSH
    if (payload.type === "message") {
      const { pairId, senderId, text, mediaType } = payload;

      const pair = await db.getDocument(DB, "pair", pairId);

      const partnerId =
        pair.partnerOne.$id === senderId
          ? pair.partnerTwo.$id
          : pair.partnerOne.$id;

      const partner = await db.getDocument(DB, "user", partnerId);

      if (!partner.pushToken) {
        return res.json({ ok: true, skipped: "no token" });
      }

      // throttle
      const now = Date.now();
      const last = pair.lastMessagePushAt
        ? new Date(pair.lastMessagePushAt).getTime()
        : 0;

      if (now - last < 30000) {
        return res.json({ ok: true, skipped: "throttled" });
      }

      const unread = await db.listDocuments(DB, "messages", [
        Query.equal("conversationId", pairId),
        Query.equal("status", "sent"),
        Query.equal("senderId", senderId),
      ]);

      let body = text?.slice(0, 120) ?? "New message";

      if (mediaType === "image") body = "📷 Sent a photo";
      if (mediaType === "audio") body = "🎧 Sent a voice note";

      if (unread.total > 1) body = `💬 ${unread.total} new messages`;

      await sendExpoPush(
        partner.pushToken,
        "💞 From your space",
        body,
        { pairId },
        unread.total,
      );

      await db.updateDocument(DB, "pair", pairId, {
        lastMessagePushAt: now,
      });

      return res.json({ ok: true });
    }

    // THINKING OF YOU
    if (payload.type === "thinking") {
      const { pairId, fromUserId, toUserId, fromName } = payload;

      const user = await db.getDocument(DB, "user", toUserId);

      await db.createDocument(DB, "thinking_pings", ID.unique(), {
        pairId,
        fromUserId,
        toUserId,
        dateKey: new Date().toISOString().slice(0, 10),
      });

      await sendExpoPush(
        user.pushToken,
        "💞 Thinking of you",
        `${fromName} is thinking about you right now`,
        { pairId },
      );

      return res.json({ ok: true });
    }

    // REMINDER PUSH
    if (payload.type === "reminder") {
      const reminder = await db.getDocument(
        DB,
        "reminders",
        payload.reminderId,
      );

      const pair = await db.getDocument(DB, "pair", reminder.pairId);

      const targets = [];

      if (reminder.notifySelf) targets.push(reminder.createdBy);
      if (reminder.notifyPartner) {
        const partnerId =
          pair.partnerOne.$id === reminder.createdBy
            ? pair.partnerTwo.$id
            : pair.partnerOne.$id;
        targets.push(partnerId);
      }

      for (const uid of targets) {
        const user = await db.getDocument(DB, "user", uid);

        await sendExpoPush(user.pushToken, "⏰ Reminder", reminder.title, {
          reminderId: reminder.$id,
        });
      }

      // mark sent
      await db.updateDocument(DB, "reminders", reminder.$id, {
        isActive: false,
      });

      return res.json({ ok: true });
    }

    return res.json({ ok: false, error: "Unknown type" }, 400);
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: e.message }, 500);
  }
};
