export type QuestionCategory = "light" | "deep" | "flirty" | "reflective";

export type QuestionItem = {
  id: string;
  text: string;
  category: QuestionCategory;
};

export const QUESTION_BANK: QuestionItem[] = [
  // 💬 LIGHT (12)
  { id: "l1", text: "What made you smile today?", category: "light" },
  {
    id: "l2",
    text: "What tiny thing reminded you of me recently?",
    category: "light",
  },
  {
    id: "l3",
    text: "What was the best small moment of your day?",
    category: "light",
  },
  {
    id: "l4",
    text: "What are you looking forward to this week?",
    category: "light",
  },
  {
    id: "l5",
    text: "What song matches your mood right now?",
    category: "light",
  },
  { id: "l6", text: "What food are you craving lately?", category: "light" },
  { id: "l7", text: "What did you enjoy doing today?", category: "light" },
  { id: "l8", text: "What made today easier?", category: "light" },
  { id: "l9", text: "One thing that felt peaceful today?", category: "light" },
  { id: "l10", text: "What’s your comfort show/movie?", category: "light" },
  { id: "l11", text: "What would make tonight better?", category: "light" },
  {
    id: "l12",
    text: "What’s your current favorite routine?",
    category: "light",
  },

  // 💞 DEEP (14)
  {
    id: "d1",
    text: "When do you feel most understood by me?",
    category: "deep",
  },
  {
    id: "d2",
    text: "What do you want us to build together?",
    category: "deep",
  },
  {
    id: "d3",
    text: "What does emotional safety mean to you?",
    category: "deep",
  },
  { id: "d4", text: "What helps you feel supported?", category: "deep" },
  {
    id: "d5",
    text: "When did you last feel really proud of yourself?",
    category: "deep",
  },
  { id: "d6", text: "What do you need more of these days?", category: "deep" },
  {
    id: "d7",
    text: "What does love feel like to you lately?",
    category: "deep",
  },
  { id: "d8", text: "What fear have you overcome recently?", category: "deep" },
  {
    id: "d9",
    text: "What kind of future feels right for you?",
    category: "deep",
  },
  { id: "d10", text: "What makes connection feel strong?", category: "deep" },
  {
    id: "d11",
    text: "What does trust mean to you in practice?",
    category: "deep",
  },
  {
    id: "d12",
    text: "What do you want us to protect no matter what?",
    category: "deep",
  },
  { id: "d13", text: "When do you feel closest to me?", category: "deep" },
  {
    id: "d14",
    text: "What part of yourself are you growing right now?",
    category: "deep",
  },

  // 🔥 FLIRTY (12)
  {
    id: "f1",
    text: "What’s your favorite way I show affection?",
    category: "flirty",
  },
  {
    id: "f2",
    text: "When do I look most attractive to you?",
    category: "flirty",
  },
  {
    id: "f3",
    text: "What’s one thing you want from me this week?",
    category: "flirty",
  },
  { id: "f4", text: "Your favorite thing about my voice?", category: "flirty" },
  {
    id: "f5",
    text: "What outfit of mine do you like most?",
    category: "flirty",
  },
  {
    id: "f6",
    text: "One place you want us alone together?",
    category: "flirty",
  },
  {
    id: "f7",
    text: "Something you want more of between us?",
    category: "flirty",
  },
  {
    id: "f8",
    text: "What small gesture melts you fastest?",
    category: "flirty",
  },
  {
    id: "f9",
    text: "What kind of date would you plan for us?",
    category: "flirty",
  },
  { id: "f10", text: "What makes you miss me instantly?", category: "flirty" },
  {
    id: "f11",
    text: "What’s your favorite memory of us laughing?",
    category: "flirty",
  },
  {
    id: "f12",
    text: "What would you steal from my wardrobe?",
    category: "flirty",
  },

  // 🧠 REFLECTIVE (12)
  { id: "r1", text: "What did today teach you?", category: "reflective" },
  { id: "r2", text: "What restores your energy best?", category: "reflective" },
  {
    id: "r3",
    text: "What are you learning about yourself lately?",
    category: "reflective",
  },
  {
    id: "r4",
    text: "What habit are you trying to build?",
    category: "reflective",
  },
  { id: "r5", text: "What drains your energy most?", category: "reflective" },
  {
    id: "r6",
    text: "What boundary helped you recently?",
    category: "reflective",
  },
  {
    id: "r7",
    text: "What are you trying to improve gently?",
    category: "reflective",
  },
  {
    id: "r8",
    text: "What does balance look like for you now?",
    category: "reflective",
  },
  {
    id: "r9",
    text: "What are you grateful for about yourself?",
    category: "reflective",
  },
  {
    id: "r10",
    text: "What do you want to say more often?",
    category: "reflective",
  },
  {
    id: "r11",
    text: "What do you want to worry about less?",
    category: "reflective",
  },
  {
    id: "r12",
    text: "What truth feels important right now?",
    category: "reflective",
  },
];
