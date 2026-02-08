import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, error }) => {
  try {
    const { pairId, senderId, text, type } = JSON.parse(req.body);

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);

    const DB = process.env.DB_ID;

    // get pair
    if (!pairId) {
      return res.status(400).json({ ok: false, error: "Missing pairId" });
    }
    const pair = await db.getDocument(DB, "pair", pairId);

    const partnerId =
      pair.partnerOne?.$id === senderId
        ? pair.partnerTwo?.$id
        : pair.partnerOne?.$id;

    if (!partnerId) {
      return res.status(400).json({ ok: false, error: "Partner not found" });
    }
    const partner = await db.getDocument(DB, "user", partnerId);

    if (!partner.pushToken) {
      return res.json({ ok: true, skipped: "no token" });
    }

    // throttle pushes (30 sec window)
    const now = Date.now();
    if (pair.lastMessagePushAt && now - pair.lastMessagePushAt < 30000) {
      return res.json({ ok: true, skipped: "throttled" });
    }

    // count unread messages
    const unread = await db.listDocuments(DB, "messages", [
      Query.equal("conversationId", pairId),
      Query.equal("status", "sent"),
      Query.equal("senderId", senderId),
      Query.limit(100),
    ]);

    const unreadCount = unread.total;

    // build body
    let pushBody = text?.slice(0, 120) ?? "New message";

    if (type === "image") pushBody = "📷 Sent a photo";
    if (type === "audio") pushBody = "🎧 Sent a voice note";

    if (unreadCount > 1) {
      pushBody = `💬 ${unreadCount} new messages`;
    }

    // send expo push
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: partner.pushToken,
        title: "💞 From your space",
        body: pushBody,
        data: { pairId },
      }),
    });

    // update throttle timestamp
    await db.updateDocument(DB, "pair", pairId, {
      lastMessagePushAt: now,
    });

    return res.json({ ok: true });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: e.message }, 500);
  }
};
