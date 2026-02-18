export const moodGroups = [
  {
    label: "Warm & close",
    moods: [
      { emoji: "🥰", label: "Affectionate" },
      { emoji: "😊", label: "Content" },
      { emoji: "😌", label: "Peaceful" },
      { emoji: "💗", label: "Soft heart" },
    ],
  },
  {
    label: "Cozy energy",
    moods: [
      { emoji: "☕", label: "Slow day" },
      { emoji: "😴", label: "Sleepy" },
      { emoji: "🌙", label: "Dreamy" },
      { emoji: "🛋️", label: "Resting" },
    ],
  },
  {
    label: "Thinking of you",
    moods: [
      { emoji: "💭", label: "Thinking" },
      { emoji: "🥺", label: "Missing you" },
      { emoji: "🫂", label: "Need a hug" },
      { emoji: "🤍", label: "Quiet" },
    ],
  },
  {
    label: "Playful spark",
    moods: [
      { emoji: "😜", label: "Silly" },
      { emoji: "😎", label: "Confident" },
      { emoji: "🔥", label: "Fired up" },
      { emoji: "🎵", label: "Vibing" },
    ],
  },
];

export type EmotionTheme = {
  tint: string;
  softBg: string;
  primaryAction: string;
  primaryLabel: string;
  suggestedMessage: string;
};

export const getEmotionTheme = (label?: string): EmotionTheme => {
  if (!label) {
    return {
      tint: "#E8D8DC",
      softBg: "#F8F4F5",
      primaryAction: "Be there 🤍",
      primaryLabel: "Send love",
      suggestedMessage: "I'm here with you.",
    };
  }

  // Sad / missing / quiet
  if (["Missing you", "Need a hug", "Quiet"].includes(label)) {
    return {
      tint: "#AFC8F8",
      softBg: "#EEF4FF",
      primaryAction: "Hold them 🤍",
      primaryLabel: "Send comfort",
      suggestedMessage: "I’m right here with you. You’re not alone.",
    };
  }

  // Warm & close
  if (["Affectionate", "Content", "Peaceful", "Soft heart"].includes(label)) {
    return {
      tint: "#F5B6C8",
      softBg: "#FFF1F5",
      primaryAction: "Lean in 💞",
      primaryLabel: "Send sweetness",
      suggestedMessage: "I love this energy between us.",
    };
  }

  // Cozy energy
  if (["Sleepy", "Dreamy", "Slow day", "Resting"].includes(label)) {
    return {
      tint: "#C7B8F5",
      softBg: "#F3F0FF",
      primaryAction: "Let them rest 🌙",
      primaryLabel: "Send calm",
      suggestedMessage: "Rest gently. I’m thinking of you.",
    };
  }

  // Playful spark
  if (["Silly", "Confident", "Fired up", "Vibing"].includes(label)) {
    return {
      tint: "#FFB27A",
      softBg: "#FFF5EC",
      primaryAction: "Match their energy 🔥",
      primaryLabel: "Send spark",
      suggestedMessage: "I love this energy 😏",
    };
  }

  return {
    tint: "#E8D8DC",
    softBg: "#F8F4F5",
    primaryAction: "Be there 🤍",
    primaryLabel: "Send love",
    suggestedMessage: "I'm here with you.",
  };
};
