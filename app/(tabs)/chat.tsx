import ChatBubble from "@/components/ChatBubble";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import {
  appwriteConfig,
  client,
  getMessages,
  getPartner,
  getUser,
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
  const [isloading, setIsLoading] = useState(false);

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
    if (!partner?.pairId) return;
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messageCollectionId}.documents`;

    const unsub = client.subscribe(channel, (event) => {
      if (!event.events.some((e) => e.endsWith(".create"))) return;

      const msg = event.payload as MessageDocument;

      if (msg.conversationId === partner.pairId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => unsub();
  }, [partner?.pairId]);

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
            const mine = item.senderId === user?.$id;

            return <ChatBubble mine={mine} text={item.text ?? ""} />; // partner = left, me = right
          }}
          keyExtractor={(item) => item?.$id ?? "unknown"}
          contentContainerStyle={{ padding: 12 }}
          recycleItems={true}
          initialScrollIndex={messages.length - 1}
          alignItemsAtEnd
          maintainScrollAtEnd
          maintainScrollAtEndThreshold={0.5}
          maintainVisibleContentPosition
          estimatedItemSize={90}
        />

        {/* Input */}
        {partner?.pairId && <ChatInput pairId={partner.pairId} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
