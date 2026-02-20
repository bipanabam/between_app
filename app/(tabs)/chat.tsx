import ChatBubble from "@/components/chat/ChatBubble";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ScheduleMessageSheet from "@/components/chat/ScheduleMessageSheet";
import HeartLoader from "@/components/HearLoader";
import {
  addReaction,
  appwriteConfig,
  client,
  getMessages,
  getPartner,
  getScheduledMessages,
  getUser,
  markDelivered,
  markMessagesRead,
  scheduleMessage,
} from "@/lib/appwrite";
import { isOnline } from "@/lib/helper";
import { MessageDocument, ScheduledMessages } from "@/types/type";
import { formatChatDate } from "@/utility/formatChatDate";
import { LegendList } from "@legendapp/list";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { CalendarIcon, TimerIcon } from "lucide-react-native";
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
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessages[]
  >([]);

  const [replyingTo, setReplyingTo] = useState<MessageDocument | null>(null);
  const [isloading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeReactionMsg, setActiveReactionMsg] = useState<{
    message: MessageDocument;
    position: { x: number; y: number };
    mine: boolean;
  } | null>(null);

  const [showMenu, setShowMenu] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const partnerOnline = isOnline(partner?.lastActiveAt);

  // Fetch user & partner
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
          const scheduledDocs = await getScheduledMessages(partnerDoc.pairId);
          setScheduledMessages(scheduledDocs);
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
    markMessagesRead(
      messages.filter((m) => m.status !== "sending"),
      user.$id,
    );
  }, [messages, user]);

  const handleOptimisticSend = (newMsg: MessageDocument) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  useEffect(() => {
    if (!partner?.pairId || !user) return;
    const timer = setTimeout(() => {
      const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messageCollectionId}.documents`;

      const unsub = client.subscribe(channel, (event) => {
        if (
          !event.events.some(
            (e) => e.endsWith(".create") || e.endsWith(".update"),
          )
        )
          return;

        const raw = event.payload as MessageDocument;

        const msg: MessageDocument = {
          ...raw,
          senderId:
            typeof raw.senderId === "string"
              ? raw.senderId
              : (raw.senderId?.$id ?? ""),
          status: raw.status ?? "sent",
        };

        if (msg.conversationId !== partner.pairId) return;
        // if message is from partner then mark delivered
        if (msg.senderId !== user.$id && msg.status === "sent") {
          markDelivered(msg.$id);
        }

        setMessages((prev) => {
          // match optimistic by clientId
          if (msg.clientId) {
            const idx = prev.findIndex((m) => m.clientId === msg.clientId);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = msg;
              return copy;
            }
          }

          // replace by id if exists
          const idxById = prev.findIndex((m) => m.$id === msg.$id);
          if (idxById !== -1) {
            const copy = [...prev];
            copy[idxById] = msg;
            return copy;
          }

          // otherwise append
          return [...prev, msg];
        });
      });

      return () => unsub();
    }, 200); // 200ms delay to let WebSocket connect
    return () => clearTimeout(timer);
  }, [partner?.pairId, user]);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const getSenderId = (m: MessageDocument) => {
    if (!m?.senderId) return undefined;

    if (typeof m.senderId === "string") return m.senderId;

    if (typeof m.senderId === "object" && "$id" in m.senderId) {
      return m.senderId.$id;
    }

    return undefined;
  };
  const lastMineId = [...messages]
    .reverse()
    .find((m) => getSenderId(m) === user.$id)?.$id;

  // Compute which messages should show ticks
  const lastUserMsgId = React.useMemo(() => {
    if (!user) return null;

    const lastUserIndex = messages.map(getSenderId).lastIndexOf(user.$id);
    if (lastUserIndex === -1) return null;

    const nextMsg = messages[lastUserIndex + 1];
    if (!nextMsg) {
      return messages[lastUserIndex].$id;
    }

    return null;
  }, [messages, user]);

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

  const handleScheduleCreate = async (text: string, scheduledAt: string) => {
    if (!partner?.pairId || !user) return;
    const newSchedule = await scheduleMessage({
      text,
      scheduledAt,
      conversationId: partner.pairId,
      senderId: user.$id,
    });
    setScheduledMessages((prev) =>
      prev.map((m) => (m.$id === newSchedule.$id ? newSchedule : m)),
    );
    setShowScheduleModal(false);
  };

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
          status={partnerOnline ? "Here with you" : "Recently offline"}
          online={partnerOnline}
          scheduledCount={scheduledMessages.length}
          onOpenMenu={() => setShowMenu(true)}
        />

        {showMenu && (
          <>
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 40,
              }}
              onPress={() => setShowMenu(false)}
            />

            {/* Menu */}
            <View
              style={{
                position: "absolute",
                top: 60,
                right: 16,
                zIndex: 50,
              }}
              className="w-48 rounded-2xl bg-white shadow-lg overflow-hidden"
            >
              <Pressable
                onPress={() => {
                  setShowScheduleModal(true);
                  setShowMenu(false);
                }}
                className="flex-row items-center gap-2 px-4 py-3"
              >
                <TimerIcon size={16} color="#bc8f97" />
                <Text className="text-sm">Schedule a message</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // redirect to scheduled messages screen
                  setShowMenu(false);
                  router.push(`/schedule/${partner.pairId}/`);
                }}
                className="flex-row items-center gap-2 px-4 py-3"
              >
                <CalendarIcon size={16} color="#bc8f97" />
                <Text className="text-sm">View scheduled</Text>
              </Pressable>

              <View className="h-px bg-gray-200" />

              <Pressable
                onPress={() => {
                  setMessages([]);
                  setShowMenu(false);
                }}
                className="px-4 py-3"
              >
                <Text className="text-sm text-red-500">Clear chat</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Messages */}
        <LegendList
          data={messages}
          style={{ backgroundColor: "rgb(233 230 226 / 0.7)" }}
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
                  showReceipt={item.$id === lastUserMsgId} //only show ticks for last message
                />
              </View>
            );
          }}
          keyExtractor={(item) => item.$id}
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
            senderId={user.$id}
            replyingTo={replyingTo}
            clearReply={() => setReplyingTo(null)}
            onSendMessage={(msg) => {
              setMessages((prev) => [...prev, msg]);
            }}
            onSendError={(tempId) => {
              setMessages((prev) => prev.filter((m) => m.$id !== tempId));
              //Alert.alert("Failed to send message");
            }}
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
      <ScheduleMessageSheet
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleCreate}
      />
    </SafeAreaView>
  );
};

export default Chat;
