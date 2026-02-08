import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, error }) => {
  try {
    const { pairId, senderId, text, type } = JSON.parse(req.body);

    // Add validation
    if (!pairId || !senderId) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields" });
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);

    const DB = process.env.DB_ID;

    let pair, partner;
    // get pair
    try {
      pair = await db.getDocument(DB, "pair", pairId);
    } catch (e) {
      return res.status(404).json({ ok: false, error: "Pair not found" });
    }

    const partnerId =
      pair.partnerOne?.$id === senderId
        ? pair.partnerTwo?.$id
        : pair.partnerOne?.$id;

    if (!partnerId) {
      return res.status(400).json({ ok: false, error: "Partner not found" });
    }

    try {
      partner = await db.getDocument(DB, "user", partnerId);
    } catch (e) {
      return res
        .status(404)
        .json({ ok: false, error: "Partner user not found" });
    }

    if (!partner.pushToken) {
      return res.json({ ok: true, skipped: "no token" });
    }

    // throttle pushes (30 sec window)
    const now = Date.now();
    const lastPushTime = pair.lastMessagePushAt
      ? typeof pair.lastMessagePushAt === "number"
        ? pair.lastMessagePushAt
        : new Date(pair.lastMessagePushAt).getTime()
      : 0;
    if (lastPushTime && now - lastPushTime < 30000) {
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
    const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: partner.pushToken,
        title: "💞 From your space",
        body: pushBody,
        data: { pairId },
        sound: "default",
        badge: unreadCount, //iOS badge
        priority: "high",
      }),
    });

    const pushResult = await pushResponse.json();

    // Check for invalid tokens
    if (pushResult.data?.[0]?.status === "error") {
      if (pushResult.data[0].details?.error === "DeviceNotRegistered") {
        // Clear invalid token
        await db.updateDocument(DB, "user", partnerId, {
          pushToken: null,
        });
      }
      console.error("Push failed:", pushResult.data[0]);
    }

    // update throttle timestamp
    await db.updateDocument(DB, "pair", pairId, {
      lastMessagePushAt: now,
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("Push notification error:", e);
    error(e);
    return res.json({ ok: false, error: e.message }, 500);
  }
};
