import { Client, Databases, Functions, Query, ID } from "node-appwrite";

export default async ({ res, log }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const fn = new Functions(client);
  const DB = process.env.DB_ID;

  const now = new Date().toISOString();

  let processed = 0;

  try {
    /* REMINDERS */
    const reminders = await db.listDocuments(DB, "reminders", [
      Query.equal("isActive", true),
      Query.lessThanEqual("nextTriggerAt", now),
      Query.limit(100),
    ]);

    for (const r of reminders.documents) {
      await fn.createExecution(
        process.env.PUSH_DISPATCH_FUNCTION_ID,
        JSON.stringify({
          type: "reminder",
          reminderId: r.$id,
        }),
      );

      processed++;
    }

    /* SCHEDULED MESSAGES */
    const scheduled = await db.listDocuments(DB, "scheduled_messages", [
      Query.equal("status", "pending"),
      Query.lessThanEqual("scheduledAt", now),
      Query.limit(100),
    ]);

    for (const s of scheduled.documents) {
      // Create real message
      const msg = await db.createDocument(
        DB,
        "messages",
        ID.unique(),
        {
          text: s.text,
          conversationId: s.conversationId,
          senderId: s.senderId,
          status: "sent",
          scheduled: true,
        },
      );

      // Trigger push dispatch
      await fn.createExecution(
        process.env.PUSH_DISPATCH_FUNCTION_ID,
        JSON.stringify({
          type: "scheduled_message",
          pairId: s.conversationId,
          senderId: s.senderId,
          text: s.text,
        }),
      );

      // Mark scheduled doc as sent
      await db.updateDocument(
        DB,
        "scheduled_messages",
        s.$id,
        {
          status: "sent",
          sentAt: now,
        },
      );

      processed++;
    }

    return res.json({ ok: true, processed });
  } catch (e) {
    log(e.message);
    return res.json({ ok: false, error: e.message }, 500);
  }
};