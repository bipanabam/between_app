import { Reply } from "lucide-react-native";
import { memo, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const ChatBubble = memo(
  ({
    mine,
    message,
    text,
    replyPreview,
    onReplySwipe,
    myUserId,
    onLongPress,
    isShowingReactions,
  }: any) => {
    const swipeRef = useRef<Swipeable>(null);
    const reactionScaleAnim = useRef(new Animated.Value(1)).current;
    const bubbleRef = useRef<View>(null);

    const renderLeftActions = () => (
      <View className="justify-center px-4">
        <Reply size={15} />
      </View>
    );

    const handleLongPress = () => {
      bubbleRef.current?.measure((x, y, width, height, pageX, pageY) => {
        onLongPress?.({ x: pageX, y: pageY + height });
      });
    };

    // parse reactions safely
    let reactionMap: Record<string, string> = {};
    try {
      if (message.reactions) {
        reactionMap = JSON.parse(message.reactions);
      }
    } catch {}

    const reactionCounts = Object.values(reactionMap).reduce(
      (acc: Record<string, number>, e) => {
        acc[e] = (acc[e] || 0) + 1;
        return acc;
      },
      {},
    );
    const myReaction = reactionMap[myUserId];

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
        <View className={mine ? "items-end" : "items-start"}>
          {/* Chat message */}
          <Pressable onLongPress={handleLongPress} delayLongPress={200}>
            <View
              ref={bubbleRef}
              className={`max-w-[80%] rounded-3xl px-5 py-4 mb-1 ${
                mine ? "bg-[#DDE3E6]" : "bg-[#E9DFDB]"
              } ${isShowingReactions ? "opacity-80" : ""}`}
            >
              {replyPreview && (
                <View className="mb-2 border-l-2 border-primary/40 pl-3 bg-black/5 rounded-md py-1">
                  <Text className="text-sm italic">{replyPreview}</Text>
                </View>
              )}

              <Text className="text-base">{text}</Text>
            </View>
          </Pressable>

          {/* Reaction summary */}
          {Object.keys(reactionCounts).length > 0 && (
            <View className="flex-row gap-2 mb-3 flex-wrap">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <Animated.View
                  key={emoji}
                  style={{
                    transform: [
                      {
                        scale: myReaction === emoji ? reactionScaleAnim : 1,
                      },
                    ],
                  }}
                  className={`px-2 py-1 rounded-full ${
                    myReaction === emoji ? "bg-primary/20" : "bg-card"
                  }`}
                >
                  <Text className="text-sm">
                    {emoji} {count}
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </Swipeable>
    );
  },
  (prev, next) => {
    // Only re-render if text, reactions, or specific states change
    return (
      prev.message.reactions === next.message.reactions &&
      prev.isShowingReactions === next.isShowingReactions &&
      prev.text === next.text
    );
  },
);

export default ChatBubble;
