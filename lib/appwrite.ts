import { PairDocument, PairInviteDocument, UserDocument } from "@/types/type";
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
  const session = await account.createEmailToken(ID.unique(), email);

  await SecureStore.setItemAsync("otp_user_id", session.userId);
};

export const verifyOtp = async (otp: string) => {
  const userId = await SecureStore.getItemAsync("otp_user_id");

  if (!userId) throw new Error("Missing userId");

  await account.createSession(userId, otp);

  await SecureStore.deleteItemAsync("otp_user_id");

  return await ensureUserDocument();
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

// pair
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
    [Query.equal("code", code)],
  );

  if (!invites.documents.length) throw new Error("Invalid code");

  const invite = invites.documents[0];

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

  // If user already created own pair → delete it
  if (user.pairId && user.pairId !== pair.$id) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.pairCollectionId,
      user.pairId,
    );
  }

  // Update pair
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.pairCollectionId,
    pair.$id,
    {
      partnerTwo: userId,
      isComplete: true,
    },
    [
      Permission.read(Role.user(pair.partnerOne)),
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(pair.partnerOne)),
      Permission.update(Role.user(userId)),
    ],
  );

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

  // update user
  await updateUser({
    pairId: pair.$id,
  });

  return pair;
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
