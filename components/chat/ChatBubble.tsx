import dayjs from "dayjs";
import { Reply, Send } from "lucide-react-native";
import { memo, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
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
    showReceipt,
  }: any) => {
    const swipeRef = useRef<Swipeable>(null);
    const reactionScaleAnim = useRef(new Animated.Value(1)).current;
    const bubbleRef = useRef<View>(null);
    const isSending = message.status === "sending";
    const isImage = message.type === "image";
    const [showSeen, setShowSeen] = useState(false);

    const renderLeftActions = () => (
      <View className="justify-center px-4">
        <Reply size={15} />
      </View>
    );

    const renderTicks = () => {
      if (!mine) return null;

      if (message.status === "sending") return null;

      if (message.status === "sent")
        return <Text className="text-xs opacity-50">sent</Text>;

      if (message.status === "delivered")
        return <Text className="text-xs opacity-60">delivered</Text>;

      if (message.status === "read")
        return <Text className="text-xs text-primary">seen</Text>;

      return null;
    };
    useEffect(() => {
      if (!showSeen) return;
      const t = setTimeout(() => setShowSeen(false), 2000);
      return () => clearTimeout(t);
    }, [showSeen]);

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
              className={`max-w-[80%] rounded-3xl mb-1 ${
                mine ? "bg-[#DDE3E6]" : "bg-[#E9DFDB]"
              } ${isShowingReactions ? "opacity-80" : ""} 
               ${isImage ? "p-1" : "px-5 py-4"}`}
              style={{ opacity: isSending ? 0.6 : 1 }}
            >
              {replyPreview && (
                <View className="mb-2 border-l-2 border-primary/40 pl-3 bg-black/5 rounded-md py-1">
                  <Text className="text-sm italic">{replyPreview}</Text>
                </View>
              )}

              {isImage ? (
                <View className="relative">
                  <Image
                    source={{ uri: message.mediaUrl }}
                    className="w-56 h-72 rounded-2xl"
                    resizeMode="cover"
                  />

                  {isSending && (
                    <View className="absolute inset-0 items-center justify-center">
                      <ActivityIndicator size="large" />
                    </View>
                  )}
                </View>
              ) : (
                <Text className="text-base">{text}</Text>
              )}
            </View>
          </Pressable>
          {isSending && (
            <Send size={14} color="#aaa" style={{ marginLeft: 6 }} />
          )}
          {mine && showReceipt && (
            <Pressable
              onPress={() => {
                if (message.status === "read") {
                  setShowSeen((v) => !v);
                }
              }}
              className="mt-1 mr-2 items-end"
            >
              {renderTicks()}
            </Pressable>
          )}
          {showSeen && message.readAt && (
            <View className="px-3 py-1 rounded-full mt-1">
              <Text className="text-mutedForeground text-xs">
                Seen at {dayjs(message.readAt).format("HH:mm")}
              </Text>
            </View>
          )}

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
    return (
      prev.message.$id === next.message.$id &&
      prev.message.reactions === next.message.reactions &&
      prev.isShowingReactions === next.isShowingReactions &&
      prev.text === next.text &&
      prev.message.status === next.message.status &&
      prev.message.mediaUrl === next.message.mediaUrl &&
      prev.showTicks === next.showTicks
    );
  },
);

export default ChatBubble;
