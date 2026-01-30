import { Models } from "react-native-appwrite";

export interface CreateUserProps {
  email: string;
}

export interface UserDocument extends Models.Document {
  email: string;
  nickname?: string;
  passcodeHash?: string;
  pairId?: string | null;
}

export interface CreatePairProps {
  createdBy: string; // userId
}
