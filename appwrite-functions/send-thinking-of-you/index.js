import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    if (!req.body) {
      return res.json({ ok: false, error: "Missing body" }, 400);
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);

    const body = JSON.parse(req.body);
    const { pairId, fromUserId, toUserId, fromName } = body;

    // fetch recipient user doc
    const userDoc = await db.getDocument(process.env.DB_ID, "user", toUserId);

    const pushToken = userDoc?.pushToken;

    await db.createDocument(process.env.DB_ID, "thinking_pings", ID.unique(), {
      pairId,
      fromUserId,
      toUserId,
      dateKey: new Date().toISOString().slice(0, 10),
    });

    if (pushToken) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: pushToken,
          title: "💞 Thinking of you",
          body: `${fromName} is thinking about you right now`,
          data: { pairId },
        }),
      });
    }

    return res.json({ ok: true });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: e.message }, 500);
  }
};

// import { Client, Databases, ID } from "node-appwrite";

// export default async ({ req, res, log, error }) => {
//   log("🚀 thinking-of-you function started");

//   try {
//     if (!req.body) {
//       error("❌ Missing body");
//       return res.json({ ok: false, error: "Missing body" }, 400);
//     }

//     // ---- ENV DEBUG ----
//     log("ENV DB_ID:", process.env.DB_ID);
//     log("ENV USER TABLE:", process.env.USER_TABLE_ID || "user");
//     log("ENV PINGS TABLE:", process.env.PINGS_TABLE_ID || "thinking_pings");

//     const client = new Client()
//       .setEndpoint(process.env.APPWRITE_ENDPOINT)
//       .setProject(process.env.APPWRITE_PROJECT_ID)
//       .setKey(process.env.APPWRITE_API_KEY);

//     const db = new Databases(client);

//     const body = JSON.parse(req.body);
//     log("📦 Payload:", JSON.stringify(body));

//     const { pairId, fromUserId, toUserId, fromName } = body;

//     // ---- USER FETCH ----
//     log("🔍 Fetching user doc:", toUserId);

//     const userDoc = await db.getDocument(
//       process.env.DB_ID,
//       process.env.USER_TABLE_ID || "user",
//       toUserId,
//     );

//     log("✅ User found:", userDoc.$id);

//     const pushToken = userDoc?.pushToken;
//     log("📲 Push token exists:", !!pushToken);

//     // ---- CREATE PING RECORD ----
//     log("📝 Creating thinking_pings record");

//     const pingDoc = await db.createDocument(
//       process.env.DB_ID,
//       process.env.PINGS_TABLE_ID || "thinking_pings",
//       ID.unique(),
//       {
//         pairId,
//         fromUserId,
//         toUserId,
//         dateKey: new Date().toISOString().slice(0, 10),
//       },
//     );

//     log("✅ Ping record created:", pingDoc.$id);

//     // ---- SEND PUSH ----
//     if (pushToken) {
//       log("📤 Sending Expo push");

//       const pushRes = await fetch("https://exp.host/--/api/v2/push/send", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           to: pushToken,
//           title: "💞 Thinking of you",
//           body: `${fromName} is thinking about you right now`,
//           data: { pairId },
//         }),
//       });

//       const pushJson = await pushRes.json();
//       log("📬 Push response:", JSON.stringify(pushJson));
//     } else {
//       log("⚠️ No push token — skipping push");
//     }

//     log("🎉 Function completed successfully");

//     return res.json({ ok: true });
//   } catch (e) {
//     error("🔥 Function failed:");
//     error(e.message);
//     error(e.stack);
//     return res.json({ ok: false, error: e.message }, 500);
//   }
// };
