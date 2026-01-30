import { Models } from "react-native-appwrite";

export interface CreateUserProps {
  email: string;
}

export interface UserDocument extends Models.Document {
  email: string;
  nickname?: string;
  passcodeHash?: string;
  pairId?: string | null;
  avatar?: string;
}

export interface CreatePairProps {
  createdBy: string; // userId
}

export type PairStatus = "pending" | "active" | "cancelled" | "archived";
export interface PairDocument extends Models.Document {
  status: "pending" | "active" | "cancelled" | "archived";

  partnerOne: string;
  partnerTwo?: string | null;

  createdBy: string;
  isComplete: boolean;
}

export interface PairInviteDocument extends Models.Document {
  code: string;
  pairId: string;

  createdBy: string;

  expiresAt: string;

  used: boolean;
  usedBy?: string | null;
}
