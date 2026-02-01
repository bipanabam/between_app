import { Heart, Image as ImgIcon, Mic } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

const ChatInput = () => {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable className="w-10 h-10 rounded-full items-center justify-center bg-card">
        <ImgIcon size={20} color="#888" />
      </Pressable>

      <Pressable className="w-10 h-10 rounded-full items-center justify-center bg-card">
        <Mic size={20} color="#888" />
      </Pressable>

      <TextInput
        placeholder="Say something..."
        placeholderTextColor="#aaa"
        className="flex-1 h-12 rounded-2xl px-5 text-base bg-card border border-muted focus:border-primary/30"
      />

      <Pressable className="w-10 h-10 rounded-full items-center justify-center bg-card">
        <Heart size={20} color="#888" />
      </Pressable>
    </View>
  );
};

export default ChatInput;
