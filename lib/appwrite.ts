import {
  MessageDocument,
  PairDocument,
  PairInviteDocument,
  PairStats,
  UserDocument,
} from "@/types/type";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Permission,
  Query,
  Role,
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
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);

const avatars = new Avatars(client);

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

  // deleting session if exists — ignore error if none
  try {
    await account.deleteSession("current");
  } catch {
    // no active session — ok
  }
  try {
    await account.createSession(userId, otp);

    await SecureStore.deleteItemAsync("otp_user_id");

    return await ensureUserDocument();
  } catch (e) {
    console.log("OTP VERIFY ERROR", e);
    throw new Error("Error validating otp.");
  }
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
  return `BET-${Math.floor(1000 + Math.random() * 9000)}`;
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
      //   [
      //   Permission.read(Role.user(partnerOne)),
      //   Permission.read(Role.user(partnerTwo)),
      //   Permission.update(Role.user(partnerOne)),
      //   Permission.update(Role.user(partnerTwo)),
      // ]
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
        Query.orderAsc("$createdAt"),
        Query.limit(50),
      ],
    );
    return res.documents;
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
      updatedAt: new Date().toISOString(),
    },
  );
};

export const sendMessage = async ({
  pairId,
  text,
  type = "text",
  replyTo,
}: {
  pairId: string;
  text: string;
  type?: "text" | "image" | "audio";
  replyTo?: MessageDocument | null;
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
      status: "sent",
      replyToId: replyTo?.$id ?? null,
      replyPreview: replyTo?.text?.slice(0, 80) ?? null,
    },
    [
      // Permission.read(Role.users()),
      Permission.update(Role.user(senderId)),
      // Permission.delete(Role.user(senderId)),
    ],
  );
  await incrementStats(pair.$id, type);
  return msg;
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
  msgs: MessageDocument[],
  myId: string,
) => {
  const unread = msgs.filter((m) => m.senderId !== myId && !m.readAt);

  if (unread.length === 0) return;

  const now = new Date().toISOString();

  await Promise.all(
    unread.map((m) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        m.$id,
        {
          readAt: now,
          status: "read",
        },
      ),
    ),
  );
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
