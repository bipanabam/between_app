import ChatBubble from "@/components/chat/ChatBubble";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import HeartLoader from "@/components/HearLoader";
import {
  appwriteConfig,
  client,
  getMessages,
  getPartner,
  getUser,
  markMessagesRead,
} from "@/lib/appwrite";
import { MessageDocument } from "@/types/type";
import { formatChatDate } from "@/utility/formatChatDate";
import { LegendList } from "@legendapp/list";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EMOJIS = ["❤️", "🤍", "🥰", "🥹", "🌸", "✨", "🫶", "🫂", "💌"];

const Chat = () => {
  const [partner, setPartner] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [replyingTo, setReplyingTo] = useState<MessageDocument | null>(null);
  const [isloading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeReactionMsg, setActiveReactionMsg] = useState<{
    message: MessageDocument;
    position: { x: number; y: number };
    mine: boolean;
  } | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const getSenderId = (m: MessageDocument) => {
    if (!m?.senderId) return undefined;

    if (typeof m.senderId === "string") return m.senderId;

    if (typeof m.senderId === "object" && "$id" in m.senderId) {
      return m.senderId.$id;
    }

    return undefined;
  };

  useEffect(() => {
    if (activeReactionMsg) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [activeReactionMsg]);

  const handleReact = async (emoji: string) => {
    if (!activeReactionMsg || !user) return;

    const targetId = activeReactionMsg.message.$id;
    setActiveReactionMsg(null);

    // Optimistic Update: Update UI immediately
    setMessages((prev) =>
      prev.map((m) => {
        if (m.$id === targetId) {
          let currentReactions: Record<string, string> = {};
          // Parse current reactions safely
          try {
            currentReactions = m.reactions ? JSON.parse(m.reactions) : {};
          } catch (e) {
            currentReactions = {};
          }
          // toggle logic if same emoji exists
          if (currentReactions[user.$id] === emoji) {
            setIsRemoving(true);
            delete currentReactions[user.$id];
          } else {
            currentReactions[user.$id] = emoji;
          }
          // Return updated message with stringified reactions
          return { ...m, reactions: JSON.stringify(currentReactions) };
        }
        return m;
      }),
    );

    try {
      const { addReaction } = await import("@/lib/appwrite");
      if (isRemoving) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRemoving(false);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await addReaction(activeReactionMsg.message, user.$id, emoji);
    } catch (error) {
      // Rollback logic (refetch messages)
      console.error("Failed to react", error);
    }
  };

  useEffect(() => {
    const handleFirstLoad = async () => {
      setIsLoading(true);
      try {
        const [me, partnerDoc] = await Promise.all([getUser(), getPartner()]);

        setUser(me);
        setPartner(partnerDoc);

        if (partnerDoc?.pairId) {
          const messageDocs = await getMessages(partnerDoc.pairId);
          setMessages(messageDocs.filter((m) => m.senderId));
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    handleFirstLoad();
  }, []);

  // Read receipts
  useEffect(() => {
    if (!user) return;
    markMessagesRead(messages, user.$id);
  }, [messages, user]);

  useEffect(() => {
    if (!partner?.pairId || !user) return;
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messageCollectionId}.documents`;

    const unsub = client.subscribe(channel, (event) => {
      if (
        !event.events.some(
          (e) => e.endsWith(".create") || e.endsWith(".update"),
        )
      )
        return;

      const msg = event.payload as MessageDocument;

      if (msg.conversationId !== partner.pairId) return;

      setMessages((prev) => {
        const existingMsg = prev.find((m) => m.$id === msg.$id);

        const normalized = {
          ...msg,
          senderId:
            typeof msg.senderId === "string"
              ? msg.senderId
              : msg.senderId?.$id
                ? msg.senderId.$id
                : (existingMsg?.senderId ?? ""),
        };

        return prev.some((m) => m.$id === normalized.$id)
          ? prev.map((m) => (m.$id === normalized.$id ? normalized : m))
          : [...prev, normalized];
      });
    });

    return () => unsub();
  }, [partner?.pairId, user]);

  if (isloading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <HeartLoader />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ paddingBottom: 80 }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {/* Header */}
        <ChatHeader
          name={partner?.nickname}
          avatar={partner?.avatar}
          color="#E57399"
          status="here with you"
        />

        {/* Messages */}
        <LegendList
          data={messages}
          renderItem={({ item, index }) => {
            const sender = getSenderId(item);
            if (!sender || !user) return null;
            // logic for date header
            const showDateHeader =
              index === 0 ||
              dayjs(item.$createdAt).diff(
                dayjs(messages[index - 1].$createdAt),
                "minute",
              ) > 60;
            return (
              <View>
                {showDateHeader && (
                  <View className="items-center my-4">
                    <View className="bg-muted/30 px-3 py-1 rounded-full">
                      <Text className="text-xs text-mutedForeground font-medium uppercase tracking-wider">
                        {formatChatDate(item.$createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
                <ChatBubble
                  mine={sender === user.$id}
                  message={item}
                  text={item.text}
                  myUserId={user.$id}
                  replyPreview={item.replyPreview}
                  onReplySwipe={() => setReplyingTo(item)}
                  onLongPress={(position: { x: number; y: number }) => {
                    setActiveReactionMsg({
                      message: item,
                      position,
                      mine: sender === user.$id,
                    });
                  }}
                  isShowingReactions={
                    activeReactionMsg?.message.$id === item.$id
                  }
                />
              </View>
            );
          }}
          keyExtractor={(item) => {
            const sid = getSenderId(item);
            return `${item.$id}-${sid === user?.$id ? "me" : "them"}`;
          }}
          contentContainerStyle={{ padding: 12 }}
          recycleItems={false}
          initialScrollIndex={messages.length - 1}
          alignItemsAtEnd
          maintainScrollAtEnd
          maintainScrollAtEndThreshold={0.5}
          maintainVisibleContentPosition
          estimatedItemSize={90}
        />

        {/* Input */}
        {partner?.pairId && (
          <ChatInput
            pairId={partner.pairId}
            replyingTo={replyingTo}
            clearReply={() => setReplyingTo(null)}
          />
        )}

        {/* Global Emoji Picker Overlay */}
        {activeReactionMsg && (
          <>
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "transparent",
              }}
              onPress={() => setActiveReactionMsg(null)}
            />
            <Animated.View
              style={{
                position: "absolute",
                top: activeReactionMsg.position.y - 30,
                left: activeReactionMsg.mine
                  ? undefined
                  : activeReactionMsg.position.x,
                right: activeReactionMsg.mine ? 20 : undefined,
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
                zIndex: 10000,
                elevation: 10000,
              }}
              className="flex-row bg-white rounded-full px-3 py-2 gap-2 shadow-lg"
            >
              {EMOJIS.map((e) => (
                <Pressable key={e} onPress={() => handleReact(e)}>
                  <Text className="text-lg">{e}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
