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

export interface ReminderDocument extends Models.Document {
  pairId: string;
  createdBy: string;

  title: string;
  note: string | null;

  type: "nudge" | "ritual" | "custom" | "cycle";

  scheduleType: "once" | "daily" | "weekly" | "monthly";

  periodCycleId: string | null;

  startAt: ISODate;
  nextTriggerAt: ISODate;

  recurrenceRule: string | null;

  notifySelf: boolean;
  notifyPartner: boolean;
  private: boolean;

  isActive: boolean;
}

export type RecurrenceRule = {
  time: string; // "HH:mm"
  weekday?: number; // 0–6 (weekly)
  dayOfMonth?: number; // 1–31 (monthly)
};

export type CreateReminderInput = {
  title: string;
  note?: string | null;

  type: ReminderType;
  scheduleType: RecurrenceType;

  nextTriggerAt: string;
  startAt: string;

  weekday?: number;
  monthDay?: number;
  baseTime: Date;

  notify: NotifyType;
  isPrivate: boolean;

  periodCycleId?: string | null;
};

export type CycleConfig = {
  isEnabled: boolean;
  lastStartDate: string | null;
  avgCycleLength: number;
  offsets: number[];
  notifyPartner: boolean;
};

export interface PeriodCycleDocument extends Models.Document {
  pairId: string;
  partnerId: string;

  avgCycleLength: number;
  lastStartDate: string; // ISODate

  reminderOffsets: number[]; //[-2, 0, +2]

  isEnabled: boolean;
}

export interface MomentsDocument extends Models.Document {
  pairId: string;
  createdBy: string;

  type:
    | "date-night"
    | "memory"
    | "anniversary"
    | "milestone"
    | "trip"
    | "relationship-start";

  title: string;
  note: string | null;

  momentDate: datetime;

  hasReminder: boolean;
  reminderConfig: string | null;

  mediaUrl: string | null;

  isPrivate: boolean;
}
