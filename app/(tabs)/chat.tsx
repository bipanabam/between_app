import ChatBubble from "@/components/ChatBubble";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import { getPartner } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const [partner, setPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const partnerDoc = await getPartner();
      setPartner(partnerDoc);
    };
    load();
  }, []);

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
        <ScrollView
          className="flex-1 px-6 mt-2"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ChatBubble left text="Good morning 🌅" />
          <ChatBubble right text="Morning love. How did you sleep?" />
          <ChatBubble left text="Really well. Had a dream about our trip 💗" />
          <ChatBubble right text="Only 3 more weeks." />
          <ChatBubble left text="Should we look at places tonight?" />
        </ScrollView>

        {/* Input */}
        <ChatInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
