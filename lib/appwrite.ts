import { UserDocument } from "@/types/type";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Permission,
  Role,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.bipanabam.between_app",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "697a2bef0007b6073c59",
  userCollectionId: "user",
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
  const avatarUrl = avatars.getInitialsURL(accountInfo.email);

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
          // avatar: avatarUrl,
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
