import { Client, Databases, Functions, Query } from "node-appwrite";

export default async ({ res, log }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const fn = new Functions(client);

  const now = new Date().toISOString();
  let due;

  try {
    due = await db.listDocuments(process.env.DB_ID, "reminders", [
      Query.equal("isActive", true),
      Query.lessThanEqual("nextTriggerAt", now),
      Query.limit(100),
    ]);
  } catch (e) {
    return res
      .status(404)
      .json({ ok: false, error: "No reminders set yet..." });
  }

  //   const due = await db.listDocuments(process.env.DB_ID, "reminders", [
  //     Query.equal("isActive", true),
  //     Query.lessThanEqual("nextTriggerAt", now),
  //     Query.limit(100),
  //   ]);

  for (const r of due.documents) {
    await fn.createExecution(
      process.env.PUSH_DISPATCH_FUNCTION_ID,
      JSON.stringify({
        type: "reminder",
        reminderId: r.$id,
      }),
    );
  }

  return res.json({ processed: due.total });
};
