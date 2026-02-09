import { sendMessage } from "@/lib/appwrite";
import { MessageDocument } from "@/types/type";
import { Heart, Image as ImgIcon, Mic } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  pairId: string;
  senderId: string;
  replyingTo?: MessageDocument | null;
  clearReply?: () => void;
  onSendMessage: (msg: MessageDocument) => void;
  onSendError: (tempId: string) => void;
};

const ChatInput = ({
  pairId,
  senderId,
  replyingTo,
  clearReply,
  onSendMessage,
  onSendError,
}: Props) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    // Generate a temp ID
    const tempId = `temp-${Date.now()}`;

    // Create the optimistic message object
    const optimisticMsg: any = {
      $id: tempId,
      $createdAt: new Date().toISOString(),
      text: messageText,
      senderId: senderId,
      conversationId: pairId,
      status: "sending",
      replyPreview: replyingTo?.text?.slice(0, 80) ?? null,
      type: "text",
      clientId: tempId, 
    };
    onSendMessage(optimisticMsg);

    setText(""); // Clearing input immediately for better UX
    clearReply?.();

    try {
      setSending(true);

      await sendMessage({
        pairId,
        text: messageText,
        type: "text",
        replyTo: replyingTo ?? null,
        clientId: tempId,
      });
    } catch (err) {
      console.log("Send failed:", err);
      onSendError(tempId);
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="px-4 py-3">
      {/* Reply Preview */}
      {replyingTo && (
        <View className="mb-2 px-4 py-3 rounded-xl bg-muted/40">
          <Text className="text-xs text-mutedForeground mb-1">Replying to</Text>

          <Text numberOfLines={1} className="text-sm">
            {replyingTo.text}
          </Text>

          <Pressable onPress={clearReply} className="absolute right-3 top-3">
            <Text>✕</Text>
          </Pressable>
        </View>
      )}

      {/* Input Toolbar Row */}
      <View className="flex-row items-center gap-3">
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
    </View>
  );
};

export default ChatInput;
