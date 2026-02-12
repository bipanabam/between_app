import {
  CycleConfig,
  MessageDocument,
  MomentsDocument,
  PairDocument,
  PairInviteDocument,
  PairStats,
  PeriodCycleDocument,
  QuestionAnswer,
  ReminderDocument,
  ThinkingOfYouPayload,
  UserDocument,
} from "@/types/type";
import dayjs from "dayjs";
import * as FileSystem from "expo-file-system/legacy";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  Permission,
  Query,
  Role,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.bipanabam.between_app",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "697a2bef0007b6073c59",
  userCollectionId: "user",
  pairCollectionId: "pair",
  pairInviteCollectionId: "pairinvite",
  messageCollectionId: "messages",
  pairStatsCollectionId: "pairstats",
  pairDailyQuestionCollectionId: "pair_daily_questions",
  thinkingPinsCollectionId: "thinking_pings",
  remindersCollectionId: "reminders",
  periodCollectionId: "period_cycle",
  momentsCollectionId: "moments",
  THINKING_OF_YOU_FUNCTION_ID: "6985b3fa0028092fcb45",
  MESSAGE_NOTIFICATION_FUNCTION_ID: "69886ec900334c02a80c",
  storageBucketId: "6989c1f4001e85df4b05",
};

export const client = new Client();
const functions = new Functions(client);

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const avatars = new Avatars(client);

const getDateKey = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export const requestMagicLink = async (email: string) => {
  const redirectUrl = Linking.createURL("auth");
  console.log(redirectUrl);
  await account.createMagicURLToken(ID.unique(), email, redirectUrl);
};

export const requestOtp = async (email: string) => {
  const token = await account.createEmailToken(ID.unique(), email);

  await SecureStore.setItemAsync("otp_user_id", token.userId);
  // await SecureStore.setItemAsync("otp_secret", token.secret);
};

export const verifyOtp = async (otp: string) => {
  const userId = await SecureStore.getItemAsync("otp_user_id");

  if (!userId || !otp) throw new Error("Missing token data");

  try {
    await account.createSession(userId, otp);

    await SecureStore.deleteItemAsync("otp_user_id");

    return await ensureUserDocument();
  } catch (e) {
    console.log("OTP VERIFY ERROR", e);
    throw new Error("Error validating otp.");
  }
};

export const updatePushToken = async (userId: string, token: string) => {
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { pushToken: token },
  );
};

export const getUser = async () => {
  const accountInfo = await account.get();
  return accountInfo;
};

export const ensureUserDocument = async () => {
  const accountInfo = await account.get();
  const userId = accountInfo.$id;

  const avatarUrl = avatars.getInitialsURL(accountInfo.email).toString();

  try {
    return await databases.getDocument<UserDocument>(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
    );
  } catch (error: any) {
    if (error.code === 404) {
      return await databases.createDocument<UserDocument>(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        {
          email: accountInfo.email,
          nickname: "",
          passcodeHash: "",
          pairId: null,
          avatar: avatarUrl,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
        ],
      );
    }
    throw error;
  }
};

export const updateUser = async (data: {
  passcodeHash?: string;
  nickname?: string;
  pairId?: string;
  pushToken?: string;
  lastActiveAt?: string;
}) => {
  const accountInfo = await account.get();
  const userId = accountInfo.$id;

  return await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    data,
  );
};

// pair and pairInvite
const generateCode = () => {
  return `LT-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const createPairAndInvite = async () => {
  const accountInfo = await account.get();
  const userId = accountInfo.$id;

  const user = await ensureUserDocument();

  // Prevent multiple pairs
  if (user.pairId) {
    throw new Error("User already paired");
  }

  // Create pair
  const pair = await databases.createDocument<PairDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    ID.unique(),
    {
      partnerOne: userId,
      partnerTwo: null,
      createdBy: userId,
      status: "pending",
      isComplete: false,
    },
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
  );

  // Create invite
  const inviteCode = generateCode();

  const invite = await databases.createDocument<PairInviteDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairInviteCollectionId,
    ID.unique(),
    {
      code: inviteCode,
      pairId: pair.$id,
      createdBy: userId,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      used: false,
      usedBy: null,
    },
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
  );

  // update user
  await updateUser({
    pairId: pair.$id,
  });

  return invite;
};

export const joinPairByCode = async (code: string) => {
  const accountInfo = await account.get();
  const userId = accountInfo.$id;

  const user = await ensureUserDocument();

  // Find invite
  const invites = await databases.listDocuments<PairInviteDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairInviteCollectionId,
    [Query.equal("code", code.trim().toUpperCase()), Query.limit(1)],
  );

  if (!invites.documents.length) throw new Error("Invalid code");

  const invite = invites.documents[0];

  if (invite.used) throw new Error("Invite already used");

  // Check expiry
  if (new Date(invite.expiresAt) < new Date()) {
    throw new Error("Invite expired");
  }

  // Get pair
  const pair = await databases.getDocument<PairDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    invite.pairId,
  );

  if (pair.partnerTwo) {
    throw new Error("Pair already full");
  }
  if (pair.partnerOne === userId) throw new Error("Cannot join your own pair");

  // race guard
  const freshPair = await databases.getDocument<PairDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    pair.$id,
  );

  if (freshPair.partnerTwo)
    throw new Error("Invite code not available anymore.");

  let pairUpdated = false;
  let inviteUpdated = false;
  let oldPairDeleted = false;

  try {
    // If user already created own pair → delete it
    if (user.pairId && user.pairId !== pair.$id) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.pairCollectionId,
        user.pairId,
      );
      oldPairDeleted = true;
    }

    // Update pair
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.pairCollectionId,
      pair.$id,
      {
        partnerTwo: userId,
        isComplete: true,
        status: "active",
        pairFormedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ],
    );
    pairUpdated = true;

    // update invite
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.pairInviteCollectionId,
      invite.$id,
      {
        used: true,
        usedBy: userId,
      },
    );
    inviteUpdated = true;

    // update user
    await updateUser({
      pairId: pair.$id,
    });

    return pair;
  } catch (err) {
    console.log("JOIN FAILED — rolling back", err);
    // rollback pair
    if (pairUpdated) {
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.pairCollectionId,
          pair.$id,
          {
            partnerTwo: null,
            isComplete: false,
            status: "pending",
          },
        );
      } catch {}
    }

    // rollback invite
    if (inviteUpdated) {
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.pairInviteCollectionId,
          invite.$id,
          {
            used: false,
            usedBy: null,
          },
        );
      } catch {}
    }

    throw err;
  }
};

export const ensurePairDocument = async () => {
  const userDoc = await ensureUserDocument();
  if (userDoc.pairId) {
    return await databases.getDocument<PairDocument>(
      appwriteConfig.databaseId,
      appwriteConfig.pairCollectionId,
      userDoc.pairId,
    );
  } else {
    return null;
  }
};

export const getMyPair = async (): Promise<PairDocument | null> => {
  const me = await ensureUserDocument();

  if (!me?.pairId) return null;

  return databases.getDocument<PairDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    me.pairId,
  );
};

export const getActiveInvite = async () => {
  const accountInfo = await account.get();
  const userId = accountInfo.$id;

  const user = await ensureUserDocument();

  if (!user.pairId) return null;

  const invites = await databases.listDocuments<PairInviteDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairInviteCollectionId,
    [
      Query.equal("pairId", user.pairId),
      Query.equal("createdBy", userId),
      Query.equal("used", false),
    ],
  );

  if (!invites.documents.length) return null;

  return invites.documents[0];
};

export const getPartner = async (): Promise<UserDocument | null> => {
  const userDoc = await ensureUserDocument();
  const currentUserId = userDoc.$id;

  const pair = await databases.getDocument<PairDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    userDoc.pairId!,
  );

  const partnerId =
    pair.partnerOne === currentUserId ? pair.partnerTwo : pair.partnerOne;

  if (!partnerId) return null;

  const partner = await databases.getDocument<UserDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    partnerId,
  );

  if (!partner.avatar) {
    partner.avatar = avatars.getInitialsURL(partner.email).toString();
  }

  return partner;
};

// messages
export const getMessages = async (pairId: string) => {
  try {
    const res = await databases.listDocuments<MessageDocument>(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      [
        Query.equal("conversationId", pairId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ],
    );
    const messages = res.documents.reverse();
    return messages;
  } catch (err) {
    throw err;
  }
};

export const incrementStats = async (
  pairId: string,
  type: "text" | "image" | "audio",
) => {
  // fetch pair doc
  const pair = await databases.getDocument<PairDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    pairId,
  );

  // get stats (create if missing)
  const stats = await getOrCreatePairStats(pair);

  //update counters
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairStatsCollectionId,
    stats.$id,
    {
      messagesCount: stats.messagesCount + 1,
      photosCount: stats.photosCount + (type === "image" ? 1 : 0),
      voiceCount: stats.voiceCount + (type === "audio" ? 1 : 0),
    },
  );
};

export const sendMessagePush = async (payload: {
  pairId: string;
  senderId: string;
  text: string;
  type: string;
}) => {
  const res = await functions.createExecution(
    appwriteConfig.MESSAGE_NOTIFICATION_FUNCTION_ID,
    JSON.stringify(payload),
  );

  if (res.status !== "completed") {
    throw new Error("Push function failed");
  }
};

export const sendMessage = async ({
  pairId,
  text,
  type = "text",
  replyTo,
  clientId,
  mediaUrl,
}: {
  pairId: string;
  text: string;
  type?: "text" | "image" | "audio";
  replyTo?: MessageDocument | null;
  clientId?: string | null;
  mediaUrl?: string | null;
}) => {
  const accountInfo = await account.get();
  const senderId = accountInfo.$id;

  const pair = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    pairId,
  );

  const msg = databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.messageCollectionId,
    ID.unique(),
    {
      conversationId: pair.$id,
      senderId,
      text,
      type,
      mediaUrl: mediaUrl ?? null,
      status: "sent",
      replyToId: replyTo?.$id ?? null,
      replyPreview: replyTo?.text?.slice(0, 80) ?? null,
      clientId: clientId,
      deliveredAt: new Date().toISOString(),
    },
    [
      // Permission.read(Role.users()),
      Permission.update(Role.user(senderId)),
      // Permission.delete(Role.user(senderId)),
    ],
  );
  await incrementStats(pair.$id, type);

  // trigger push (fire-and-forget)
  sendMessagePush({
    pairId: pair.$id,
    senderId,
    text,
    type,
  }).catch(() => {});

  return msg;
};

export const uploadMedia = async (uri: string, mime: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      throw new Error("File does not exist");
    }

    const ext = mime.split("/")[1]?.split(";")[0] || "jpg";

    const file = {
      uri: uri,
      name: `upload-${Date.now()}.${ext}`,
      type: mime,
      size: info.size ?? 0,
    };

    const res = await storage.createFile(
      appwriteConfig.storageBucketId,
      ID.unique(),
      file as any,
    );

    if (!res?.$id) {
      throw new Error("Upload returned empty response");
    }

    return res.$id;
  } catch (err) {
    console.error("uploadMedia error:", err);
    throw err;
  }
};

export const getFileUrl = (fileId: string) => {
  return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
};

export const sendMediaMessage = async ({
  pairId,
  fileUri,
  mime,
  type,
  clientId,
}: {
  pairId: string;
  fileUri: string;
  mime: string;
  type: "image" | "audio";
  clientId: string;
}) => {
  try {
    const fileId = await uploadMedia(fileUri, mime);
    const mediaUrl = getFileUrl(fileId);

    const msg = sendMessage({
      pairId,
      text: "",
      type,
      clientId,
      mediaUrl,
    });
    return msg;
  } catch (error) {
    console.error("sendMediaMessage failed:", error);

    throw new Error(
      error instanceof Error ? error.message : "Unknown error sending media",
    );
  }
};

export const addReaction = async (
  message: MessageDocument,
  userId: string,
  emoji: string,
) => {
  let retries = 3;

  while (retries > 0) {
    try {
      const fresh = await databases.getDocument<MessageDocument>(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        message.$id,
      );

      let reactions: Record<string, string> = {};

      try {
        if (fresh.reactions) {
          reactions = JSON.parse(fresh.reactions);
        }
      } catch (e) {
        reactions = {};
      }

      // toggle/modify
      if (reactions[userId] === emoji) {
        delete reactions[userId];
      } else {
        reactions[userId] = emoji;
      }

      // update
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        message.$id,
        {
          reactions: JSON.stringify(reactions),
        },
      );
      return reactions;
    } catch (error: any) {
      if (error.code === 409) {
        // Conflict code
        retries--;
        continue;
      }
      throw error;
    }
  }
};

export const markMessagesRead = async (
  messages: MessageDocument[],
  myUserId: string,
) => {
  const unread = messages.filter(
    (m) => m.senderId !== myUserId && m.status !== "read",
  );

  if (unread.length === 0) return;

  await Promise.allSettled(
    unread.map((m) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        m.$id,
        {
          status: "read",
          readAt: new Date().toISOString(),
        },
      ),
    ),
  );
};

// export const markMessagesRead = async (
//   msgs: MessageDocument[],
//   myId: string,
// ) => {
//   const unread = msgs.filter((m) => m.senderId !== myId && !m.readAt);

//   if (unread.length === 0) return;

//   const now = new Date().toISOString();

//   await Promise.all(
//     unread.map((m) =>
//       databases.updateDocument(
//         appwriteConfig.databaseId,
//         appwriteConfig.messageCollectionId,
//         m.$id,
//         {
//           readAt: now,
//           status: "read",
//         },
//       ),
//     ),
//   );
// };

export const markDelivered = async (messageId: string) => {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      messageId,
      {
        status: "delivered",
        deliveredAt: new Date().toISOString(),
      },
    );
  } catch {}
};

export const proposeRelationshipDate = async (
  pairId: string,
  date: Date,
  userId: string,
) => {
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    pairId,
    {
      relationshipStartDatePending: date,
      relationshipStartDateProposedBy: userId,
    },
  );
};

export const confirmRelationshipDate = async (pair: PairDocument) => {
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    pair.$id,
    {
      relationshipStartDate: pair.relationshipStartDatePending,
      relationshipStartDatePending: null,
      relationshipStartDateConfirmed: true,
    },
  );
};

export const getOrCreatePairStats = async (pair: PairDocument) => {
  const res = await databases.listDocuments<PairStats>(
    appwriteConfig.databaseId,
    appwriteConfig.pairStatsCollectionId,
    [Query.equal("pairId", pair.$id), Query.limit(1)],
  );

  if (res.documents.length) return res.documents[0];

  const messages = await databases.listDocuments<MessageDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.messageCollectionId,
    [
      Query.equal("conversationId", pair.$id),
      Query.limit(5000), // adjust if needed
    ],
  );

  const docs = messages.documents;
  // let reactionsCount = 0;

  // docs.forEach((m) => {
  //   if (!m.reactions) return;
  //   try {
  //     const parsed = JSON.parse(m.reactions);
  //     reactionsCount += Object.keys(parsed).length;
  //   } catch {}
  // });

  const photosCount = docs.filter((m) => m.type === "image").length;
  const voiceCount = docs.filter((m) => m.type === "audio").length;

  const firstMessageAt = docs[0]?.$createdAt ?? null;
  const lastMessageAt = docs.at(-1)?.$createdAt ?? null;

  return databases.createDocument<PairStats>(
    appwriteConfig.databaseId,
    appwriteConfig.pairStatsCollectionId,
    ID.unique(),
    {
      pairId: pair.$id,
      messagesCount: docs.length,
      photosCount,
      voiceCount,
      savedCount: 0,

      firstMessageAt,
      lastMessageAt,
      // updatedAt: new Date().toISOString(),
    },
    [Permission.read(Role.users()), Permission.update(Role.users())],
  );
};

export const getPairStats = async (pairId: string) => {
  const res = await databases.listDocuments<PairStats>(
    appwriteConfig.databaseId,
    appwriteConfig.pairStatsCollectionId,
    [Query.equal("pairId", pairId), Query.limit(1)],
  );

  return res.documents[0] ?? null;
};

//
import { QUESTION_BANK } from "@/constant/questions";

const pickRandomQuestion = (excludeIds: string[]) => {
  const pool = QUESTION_BANK.filter((q) => !excludeIds.includes(q.id));
  if (!pool.length)
    return QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getOrCreateTodayQuestion = async (
  pair: PairDocument,
  category?: string,
  options?: { forceNew?: boolean },
) => {
  const dateKey = getDateKey();

  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.pairDailyQuestionCollectionId,
    [
      Query.equal("pairId", pair.$id),
      Query.equal("dateKey", dateKey),
      Query.limit(1),
    ],
  );

  // exists
  if (res.documents.length) {
    const doc = res.documents[0];

    if (!options?.forceNew) return doc;

    // change question → UPDATE doc
    const usedIds = [doc.questionId];

    const q = pickRandomQuestion(usedIds);

    return databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.pairDailyQuestionCollectionId,
      doc.$id,
      {
        questionId: q.id,
        category: category ?? doc.category ?? "light",
        answers: JSON.stringify([]),
        answeredBy: [],
        changeCount: (doc.changeCount ?? 0) + 1,
      },
    );
  }

  // create first time
  const recent = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.pairDailyQuestionCollectionId,
    [
      Query.equal("pairId", pair.$id),
      Query.limit(7),
      Query.orderDesc("$createdAt"),
    ],
  );

  const usedIds = recent.documents.map((d) => d.questionId);
  const q = pickRandomQuestion(usedIds);

  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairDailyQuestionCollectionId,
    ID.unique(),
    {
      pairId: pair.$id,
      questionId: q.id,
      category: category ?? "light",
      dateKey,
      answeredBy: [],
      answers: JSON.stringify([]),
      changeCount: 0,
    },
    [Permission.read(Role.users()), Permission.update(Role.users())],
  );
};

export const getQuestionText = (id: string) => {
  return QUESTION_BANK.find((q) => q.id === id)?.text ?? "Question";
};

export const submitQuestionAnswer = async (
  doc: any,
  userId: string,
  text: string,
) => {
  const answers: QuestionAnswer[] = JSON.parse(doc.answers ?? "[]");

  // remove previous answer from same user
  const filtered = answers.filter((a) => a.userId !== userId);

  filtered.push({
    userId,
    text,
    createdAt: new Date().toISOString(),
  });

  const answeredBy = Array.from(new Set([...(doc.answeredBy ?? []), userId]));

  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairDailyQuestionCollectionId,
    doc.$id,
    {
      answers: JSON.stringify(filtered),
      answeredBy,
    },
  );
};

{
  /* Thinking of you*/
}
export const sendThinkingOfYouNotification = async (
  payload: ThinkingOfYouPayload,
) => {
  const res = await functions.createExecution(
    appwriteConfig.THINKING_OF_YOU_FUNCTION_ID,
    JSON.stringify(payload),
  );
  if (res.status !== "completed") {
    throw new Error("Function failed");
  }

  return res.responseBody ? JSON.parse(res.responseBody) : null;
};

export const hasSentLoveToday = async (pairId: string, userId: string) => {
  const today = new Date().toISOString().slice(0, 10);

  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.thinkingPinsCollectionId,
    [
      Query.equal("pairId", pairId),
      Query.equal("fromUserId", userId),
      Query.equal("dateKey", today),
      Query.limit(1),
    ],
  );

  return res.total > 0;
};

export const getMutualStreak = async (pairId: string) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.thinkingPinsCollectionId,
    [Query.equal("pairId", pairId), Query.limit(500)],
  );

  const byDate: Record<string, Set<string>> = {};

  for (const doc of res.documents) {
    if (!byDate[doc.dateKey]) byDate[doc.dateKey] = new Set();
    byDate[doc.dateKey].add(doc.fromUserId);
  }

  const mutualDays = Object.entries(byDate)
    .filter(([_, users]) => users.size >= 2)
    .map(([date]) => date)
    .sort()
    .reverse();

  let streak = 0;
  let cursor = new Date();

  for (const date of mutualDays) {
    const d = cursor.toISOString().slice(0, 10);
    if (date === d) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  return streak;
};

{
  /* Mood */
}
export const updateMood = async (
  userId: string,
  emoji: string,
  label: string,
) => {
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    {
      moodEmoji: emoji,
      moodLabel: label,
      moodUpdatedAt: new Date().toISOString(),
    },
  );
};

export const getActiveMood = (user: any) => {
  if (!user?.moodUpdatedAt) return null;

  const age = Date.now() - new Date(user.moodUpdatedAt).getTime();

  const hours = age / (1000 * 60 * 60);

  if (hours > 24) return null;

  return user.moodEmoji;
};

// PERIOD CYCLES
export const upsertPeriodCycle = async (config: {
  avgCycleLength: number;
  lastStartDate: string;
  reminderOffsets: number[];
  isEnabled: boolean;
}) => {
  const me = await account.get();
  const userId = me.$id;

  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) throw new Error("No pair");

  const pairId = userDoc.pairId;

  // check existing
  const res = await databases.listDocuments<PeriodCycleDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.periodCollectionId,
    [Query.equal("pairId", pairId), Query.limit(1)],
  );

  if (res.documents.length) {
    const existing = res.documents[0];

    return databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.periodCollectionId,
      existing.$id,
      {
        ...config,
        partnerId: userId,
      },
    );
  }

  // create new
  return databases.createDocument<PeriodCycleDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.periodCollectionId,
    ID.unique(),
    {
      pairId,
      partnerId: userId,
      ...config,
    },
    [Permission.read(Role.users()), Permission.update(Role.users())],
  );
};

export const getPeriodCycle = async () => {
  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) return null;

  const res = await databases.listDocuments<PeriodCycleDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.periodCollectionId,
    [Query.equal("pairId", userDoc.pairId), Query.limit(1)],
  );

  return res.documents[0] ?? null;
};

export const buildCycleReminders = (
  periodCycleId: string,
  pairId: string,
  userId: string,
  config: {
    avgCycleLength: number;
    lastStartDate: string;
    offsets: number[];
    notifyPartner: boolean;
  },
) => {
  const base = dayjs(config.lastStartDate);
  const nextStart = base.add(config.avgCycleLength, "day");

  return config.offsets.map((offset) => {
    const trigger = nextStart.add(offset, "day");

    return {
      pairId,
      createdBy: userId,
      periodCycleId: periodCycleId,

      title: "Period Cycle care",
      note: "A softer day for presence and patience",

      type: "cycle",
      scheduleType: "once",

      startAt: trigger.toISOString(),
      nextTriggerAt: trigger.toISOString(),

      recurrenceRule: null,

      notifySelf: true,
      notifyPartner: config.notifyPartner,
      private: false,

      isActive: true,
    };
  });
};

export const createCycleReminderRows = async (
  periodCycleId: string,
  config: CycleConfig,
) => {
  const me = await account.get();
  const userId = me.$id;

  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) throw new Error("No pair");

  const pairId = userDoc.pairId;

  const rows = buildCycleReminders(periodCycleId, pairId, userId, {
    avgCycleLength: config.avgCycleLength,
    lastStartDate: config.lastStartDate!,
    offsets: config.offsets,
    notifyPartner: config.notifyPartner,
  });

  await Promise.all(
    rows.map((row) =>
      databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.remindersCollectionId,
        ID.unique(),
        row,
        [Permission.read(Role.users()), Permission.update(Role.users())],
      ),
    ),
  );
};

export const deleteCycleReminders = async (periodCycleId: string) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.remindersCollectionId,
    [Query.equal("periodCycleId", periodCycleId), Query.limit(100)],
  );

  await Promise.all(
    res.documents.map((doc) =>
      databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.remindersCollectionId,
        doc.$id,
      ),
    ),
  );
};

/**
 * Fetch reminders for the current month
 */
export const getCurrentMonthReminders = async (): Promise<
  ReminderDocument[]
> => {
  const me = await account.get();
  const userId = me.$id;

  // Get user's pair
  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) return [];

  const pairId = userDoc.pairId;
  console.log(pairId);

  // Start and end of current month
  const startOfMonth = dayjs().startOf("month").startOf("day").toISOString();
  const endOfMonth = dayjs().endOf("month").endOf("day").toISOString();

  const res = await databases.listDocuments<ReminderDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.remindersCollectionId,
    [
      Query.equal("pairId", pairId),
      Query.equal("isActive", true),
      Query.greaterThanEqual("nextTriggerAt", startOfMonth),
      Query.lessThanEqual("nextTriggerAt", endOfMonth),
      Query.limit(100),
    ],
  );
  return res.documents;
};

/**
 * Fetch all active reminders for the current user's pair
 * Optionally filter by a date range (for calendar)
 */
export const getReminders = async (options?: {
  from?: Date | string;
  to?: Date | string;
}): Promise<ReminderDocument[]> => {
  const me = await account.get();
  const userId = me.$id;

  // Get user's pair
  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) return [];

  const pairId = userDoc.pairId;

  const queries: any[] = [
    Query.equal("pairId", pairId),
    Query.equal("isActive", true),
    Query.limit(100),
  ];

  // If a date range is provided, filter by nextTriggerAt
  if (options?.from) {
    queries.push(
      Query.greaterThanEqual(
        "nextTriggerAt",
        new Date(options.from).toISOString(),
      ),
    );
  }
  if (options?.to) {
    queries.push(
      Query.lessThanEqual("nextTriggerAt", new Date(options.to).toISOString()),
    );
  }

  const res = await databases.listDocuments<ReminderDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.remindersCollectionId,
    queries,
  );

  return res.documents;
};

// MOMENTS
export const createMoment = async (data: {
  type: MomentsDocument["type"];
  title: string;
  note?: string | null;
  momentDate: string;
  hasReminder: boolean;
  reminderConfig?: any;
  isPrivate: boolean;
  mediaUrl?: string | null;
}): Promise<MomentsDocument> => {
  const me = await account.get();
  const userId = me.$id;

  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) throw new Error("No pair");

  const res = await databases.createDocument<MomentsDocument>(
    appwriteConfig.databaseId,
    appwriteConfig.momentsCollectionId,
    ID.unique(),
    {
      pairId: userDoc.pairId,
      createdBy: userId,

      type: data.type,
      title: data.title,
      note: data.note ?? null,
      momentDate: data.momentDate,

      hasReminder: data.hasReminder,
      reminderConfig: data.reminderConfig
        ? JSON.stringify(data.reminderConfig)
        : null,

      mediaUrl: data.mediaUrl ?? null,

      isPrivate: data.isPrivate,
    },
    [Permission.read(Role.users()), Permission.update(Role.user(userId))],
  );

  return res;
};

export const createMomentWithMedia = async ({
  fileUri,
  mime,
  ...momentData
}: {
  fileUri?: string | null;
  mime?: string | null;
} & Omit<Parameters<typeof createMoment>[0], "mediaUrl">) => {
  let mediaUrl: string | null = null;

  if (fileUri && mime) {
    const fileId = await uploadMedia(fileUri, mime);
    mediaUrl = getFileUrl(fileId);
  }

  return createMoment({
    ...momentData,
    mediaUrl,
  });
};

export const createReminderForMoment = async (
  momentId: string,
  config: {
    triggerAt: string;
    notifyPartner: boolean;
  },
) => {
  const me = await account.get();
  const userId = me.$id;

  const userDoc = await ensureUserDocument();
  if (!userDoc.pairId) throw new Error("No pair");

  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.remindersCollectionId,
    ID.unique(),
    {
      pairId: userDoc.pairId,
      createdBy: userId,

      title: "Moment reminder",
      note: null,

      type: "nudge",
      scheduleType: "once",

      momentId,
      periodCycleId: null,

      startAt: config.triggerAt,
      nextTriggerAt: config.triggerAt,

      recurrenceRule: null,

      notifySelf: true,
      notifyPartner: config.notifyPartner,
      private: false,

      isActive: true,
    },
    [Permission.read(Role.users()), Permission.update(Role.user(userId))],
  );
};
