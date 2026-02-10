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

  //mood
  moodEmoji?: string | null;
  moodLabel?: string | null;
  moodUpdatedAt?: datetime | null;
}

export type PairStatus = "pending" | "active" | "cancelled" | "archived";
export interface PairDocument extends Models.Document {
  status: "pending" | "active" | "cancelled" | "archived";

  partnerOne: string;
  partnerTwo?: string | null;

  createdBy: string;
  isComplete: boolean;
  pairFormedAt?: datetime | null;

  relationshipStartDate?: datetime | null;
  relationshipStartDateProposedBy?: string | null;
  relationshipStartDatePending?: datetime | null;
  relationshipStartDateConfirmed?: boolean;

  lastMessagePushAt?: number | null;
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
  text?: string | null;
  type: "text" | "image" | "audio";
  status?: "sent" | "delivered" | "read" | "sending";

  replyToId?: string | null;
  replyPreview?: string | null;

  readAt?: datetime | null;
  deliveredAt?: datetime | null;

  reactions?: string | null; // userId → emoji
  clientId?: string | null;

  mediaUrl?: string | null; //size:255
}

export type ChatMessage = Partial<MessageDocument> & {
  $id: string;
  $createdAt: string;
  senderId: string;
  conversationId: string;
  type: "text" | "image" | "audio";
  status: "sending" | "sent" | "delivered" | "read";

  text?: string | null;
  mediaUrl?: string | null;
  clientId?: string | null;
  replyToId?: string | null;
  replyPreview?: string | null;

  readAt?: datetime | null;
  deliveredAt?: datetime | null;

  reactions?: string | null; // userId → emoji
  clientId?: string | null;
  showTicks?: boolean;
};

export interface PairStats extends Models.Document {
  pairId: string;

  messagesCount: number;
  photosCount: number;
  voiceCount: number;
  savedCount: number;

  firstMessageAt: datetime;
  lastMessageAt: datetime;

  // updatedAt: datetime;
}

export interface pairDailyQuestionsDocument extends Models.Document {
  pairId: string;
  questionId: string;
  dateKey: string; // "2026-02-03"
  category: "light" | "deep" | "flirty" | "reflective";
  answeredBy: string[]; // userIds
  changeCount: number;
  answers: [
    {
      userId: string;
      text: string;
      createdAt: string;
    },
  ];
}
export type QuestionAnswer = {
  userId: string;
  text: string;
  createdAt: string;
};

export type ThinkingOfYouPayload = {
  pairId: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  // pushToken?: string;
};

export type reminders = {
  pairId: string;
  createdBy: string;

  title: string;
  note: string | null;

  type: "memory" | "ritual" | "nudge" | "cycle" | "date-night" | "custom";
  custom;

  scheduleType: "once" | "daily" | "weekly" | "monthly";

  startAt: ISODate;
  nextTriggerAt: ISODate;

  recurrenceRule: {
    interval: number;
    weekdays?: number[];
    dayOfMonth?: number;
  };

  notifySelf: boolean;
  notifyPartner: boolean;
  private: boolean;

  isActive: boolean;
  createdAt: ISODate;
};

export type period_cycle = {
  pairId;
  partnerId;

  avgCycleLength: number; //default:28
  lastStartDate: ISODate;

  reminderOffsets: number[]; //[-2, 0, +2]

  isEnabled: boolean;
};
