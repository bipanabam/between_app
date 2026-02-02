import ChatBubble from "@/components/ChatBubble";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import {
  appwriteConfig,
  client,
  databases,
  getMessages,
  getPartner,
  getUser,
  markMessagesRead,
} from "@/lib/appwrite";
import { MessageDocument } from "@/types/type";
import { LegendList } from "@legendapp/list";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const [partner, setPartner] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [replyingTo, setReplyingTo] = useState<MessageDocument | null>(null);
  const [isloading, setIsLoading] = useState(false);
  const getSenderId = (m: MessageDocument) =>
    typeof m.senderId === "string" ? m.senderId : m.senderId.$id;

  useEffect(() => {
    const handleFirstLoad = async () => {
      setIsLoading(true);
      try {
        const [me, partnerDoc] = await Promise.all([getUser(), getPartner()]);

        setUser(me);
        setPartner(partnerDoc);

        if (partnerDoc?.pairId) {
          const messageDocs = await getMessages(partnerDoc.pairId);
          setMessages(messageDocs);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    handleFirstLoad();
  }, []);

  useEffect(() => {
    if (!user) return;
    markMessagesRead(messages, user.$id);
  }, [messages, user]);

  useEffect(() => {
    if (!partner?.pairId || !user) return;
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messageCollectionId}.documents`;

    const unsub = client.subscribe(channel, async (event) => {
      if (!event.events.some((e) => e.endsWith(".create"))) return;

      const msg = event.payload as MessageDocument;

      if (msg.conversationId !== partner.pairId) return;

      const normalized = {
        ...msg,
        senderId:
          typeof msg.senderId === "string" ? msg.senderId : msg.senderId?.$id!,
      };

      setMessages((prev) => [...prev, normalized]);

      // mark delivered if partner message
      if (msg.senderId !== user.$id && !msg.deliveredAt) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.messageCollectionId,
          msg.$id,
          {
            deliveredAt: new Date().toISOString(),
            status: "delivered",
          },
        );
      }
    });

    return () => unsub();
  }, [partner?.pairId, user]);

  if (isloading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
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
          renderItem={({ item }) => {
            const mine = getSenderId(item) === user?.$id;
            return (
              <ChatBubble
                mine={mine}
                text={item.text}
                replyPreview={item.replyPreview}
                onReplySwipe={() => setReplyingTo(item)}
              />
            );
          }}
          keyExtractor={(item) =>
            `${item.$id}-${item.senderId === user?.$id ? "me" : "them"}`
          }
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
