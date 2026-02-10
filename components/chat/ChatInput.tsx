import { sendMediaMessage, sendMessage } from "@/lib/appwrite";
import { useAuth } from "@/providers/AuthProvider";
import { MessageDocument } from "@/types/type";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from "expo-audio";

import * as ImagePicker from "expo-image-picker";
import { Heart, Image as ImgIcon, Mic } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";

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
  const { user, temporarilyIgnoreAppLock } = useAuth();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  // Initialize the audio recorder
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    // console.log("Recording status:", status);
  });

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

  const handlePickImage = async () => {
    temporarilyIgnoreAppLock(); // prevents lock for this pick
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (res.canceled) return;

      const asset = res.assets[0];
      const tempId = `temp-${Date.now()}`;

      const optimistic: any = {
        $id: tempId,
        $createdAt: new Date().toISOString(),
        senderId,
        conversationId: pairId,
        text: null,
        type: "image",
        mediaUrl: asset.uri, // local preview
        status: "sending",
        clientId: tempId,
      };

      onSendMessage(optimistic);
      try {
        setSending(true);

        await sendMediaMessage({
          pairId,
          fileUri: asset.uri,
          mime: asset.mimeType ?? "image/jpeg",
          type: "image",
          clientId: tempId,
        });
      } catch (err) {
        console.log("Media send failed:", err);
        onSendError(tempId); // rollback optimistic UI
      } finally {
        setSending(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const startRecording = async () => {
    temporarilyIgnoreAppLock();

    // Request microphone permissions
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      console.log("Mic permission denied");
      return;
    }

    // Check if already recording
    if (recorder.isRecording) {
      console.log("Already recording");
      return;
    }
    try {
      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      console.log("Recording started");
    } catch (e) {
      console.log("Record start failed:", e);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorder.isRecording) {
      console.log("Not currently recording");
      return;
    }
    try {
      await recorder.stop();
      setIsRecording(false);

      // Get the URI of the recorded audio
      const uri = recorder.uri;

      if (!uri) {
        console.log("No recording URI available");
        return;
      }

      const tempId = `temp-${Date.now()}`;

      // Create optimistic message
      const optimistic: any = {
        $id: tempId,
        $createdAt: new Date().toISOString(),
        senderId,
        conversationId: pairId,
        text: null,
        type: "audio",
        mediaUrl: uri,
        status: "sending",
        clientId: tempId,
      };
      onSendMessage(optimistic);

      try {
        setSending(true);

        await sendMediaMessage({
          pairId,
          fileUri: uri,
          mime: "audio/m4a",
          type: "audio",
          clientId: tempId,
        });
      } catch (err) {
        console.log("Audio send failed:", err);
        onSendError(tempId);
      } finally {
        setSending(false);
      }
    } catch (e) {
      console.log("Stop recording failed:", e);
      setIsRecording(false);
    }
  };

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isRecording) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [isRecording]);

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
      {/* Recording Indicator */}
      {isRecording && (
        <View className="mb-2 flex-row items-center justify-between px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200">
          <View className="flex-row items-center gap-3">
            <Animated.View
              style={{ transform: [{ scale: pulse }] }}
              className="w-3 h-3 rounded-full bg-primary/60"
            />

            <Text className="text-primary font-medium">Recording voice…</Text>
          </View>

          <Text className="text-xs text-primary">release to send</Text>
        </View>
      )}

      {/* Input Toolbar Row */}
      <View className="flex-row items-center gap-3">
        <Pressable
          className="w-10 h-10 rounded-full items-center justify-center bg-card"
          onPress={handlePickImage}
        >
          <ImgIcon size={20} color="#888" />
        </Pressable>

        <Pressable
          className="w-10 h-10 rounded-full items-center justify-center bg-card"
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Mic size={20} color={isRecording ? "#E57399" : "#888"} />
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
