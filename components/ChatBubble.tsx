import { Reply } from "lucide-react-native";
import { useRef } from "react";
import { Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const ChatBubble = ({ mine, text, replyPreview, onReplySwipe }: any) => {
  const swipeRef = useRef<Swipeable>(null);
  const renderLeftActions = () => (
    <View className="justify-center px-4">
      <Reply size={15} />
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={!mine ? renderLeftActions : undefined}
      onSwipeableOpen={() => {
        onReplySwipe?.();
        swipeRef.current?.close();
      }}
      overshootRight={false}
      friction={2}
    >
      <View
        className={`max-w-[80%] rounded-3xl px-5 py-4 mb-3 ${
          mine ? "self-end bg-[#DDE3E6]" : "self-start bg-[#E9DFDB]"
        }`}
      >
        {replyPreview && (
          <View className="mb-2 border-l-2 border-primary/40 pl-3 bg-black/5 rounded-md py-1">
            <Text className="text-sm italic">{replyPreview}</Text>
          </View>
        )}

        <Text className="text-base">{text}</Text>
      </View>
    </Swipeable>
  );
};

export default ChatBubble;
