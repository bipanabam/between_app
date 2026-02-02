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

export interface MessageDocument extends Models.Document {
  conversationId: string;
  senderId: string | { $id: string };
  text: string | null;
  type: "text" | "image" | "audio";
  status: "sent" | "delivered" | "read";

  replyToId?: string | null;
  replyPreview?: string | null;

  readAt: datetime | null;
  deliveredAt: datetime | null;

  reactions?: string | null; // userId → emoji
}
