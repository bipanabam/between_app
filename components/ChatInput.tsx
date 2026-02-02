import { Heart, Image as ImgIcon, Mic } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";
import { useState } from "react";
import { sendMessage } from "@/lib/appwrite";

type Props = {
  pairId: string;
};

const ChatInput = ({ pairId }: Props) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);

      await sendMessage({
        pairId,
        text: text.trim(),
        type: "text",
      });

      setText(""); // clear after send
    } catch (err) {
      console.log("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable className="w-10 h-10 rounded-full items-center justify-center bg-card">
        <ImgIcon size={20} color="#888" />
      </Pressable>

      <Pressable className="w-10 h-10 rounded-full items-center justify-center bg-card">
        <Mic size={20} color="#888" />
      </Pressable>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Say something..."
        placeholderTextColor="#aaa"
        className="flex-1 h-12 rounded-2xl px-5 text-base bg-card border border-muted"
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />

      <Pressable
        onPress={handleSend}
        disabled={!text.trim()}
        className="w-10 h-10 rounded-full items-center justify-center bg-card"
      >
        <Heart size={20} color={text.trim() ? "#E57399" : "#888"} />
      </Pressable>
    </View>
  );
};

export default ChatInput;
