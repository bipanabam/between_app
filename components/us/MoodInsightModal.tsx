import { getEmotionTheme } from "@/constant/moodGoups";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

dayjs.extend(relativeTime);

interface Props {
  visible: boolean;
  emoji?: string;
  label?: string;
  since?: string;
  sending: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSendMessage?: (text: string) => void;
}

const MoodInsightModal = ({
  visible,
  emoji,
  label,
  since,
  sending,
  onClose,
  onPrimaryAction,
  onSendMessage,
}: Props) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const [showInput, setShowInput] = useState(false);
  const [message, setMessage] = useState("");

  const theme = getEmotionTheme(label);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
      // setMessage(theme.suggestedMessage);
    } else {
      opacity.setValue(0);
      scale.setValue(0.9);
      setShowInput(false);
    }
  }, [visible]);

  if (!visible) return null;

  const sinceText = since ? dayjs(since).fromNow() : null;

  return (
    <Modal transparent animationType="none">
      <Animated.View
        style={{
          opacity,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
        className="flex-1 justify-center items-center px-6"
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>
        <Animated.View
          style={{ transform: [{ scale }] }}
          className="w-full rounded-3xl overflow-hidden"
        >
          <LinearGradient
            colors={[theme.softBg, "#bc8f97" + "AA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24 }}
          >
            <Text
              style={{
                fontSize: 70,
                textShadowColor: theme.tint,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              }}
              className="text-center"
            >
              {emoji}
            </Text>

            <Text className="text-center text-lg font-semibold mt-3">
              {label}
            </Text>

            {sinceText && (
              <Text className="text-center text-xs mt-1 opacity-60">
                Since {sinceText}
              </Text>
            )}

            {!showInput && (
              <View className="flex-row justify-center gap-4 mt-8">
                <Pressable
                  onPress={onPrimaryAction}
                  disabled={sending}
                  style={{ backgroundColor: theme.tint }}
                  className="px-5 py-3 rounded-full"
                >
                  <Text className="font-medium text-white">
                    {theme.primaryAction}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowInput(true)}
                  className="px-5 py-3 rounded-full border border-black/10"
                >
                  <Text>Message</Text>
                </Pressable>
              </View>
            )}

            {showInput && (
              <View className="mt-6">
                <TextInput
                  // value={message}
                  onChangeText={setMessage}
                  placeholder="Write something gentle..."
                  placeholderTextColor="#BDB7B0"
                  multiline
                  className="bg-muted rounded-xl p-4 text-sm text-black"
                  style={{ minHeight: 80 }}
                />

                <Pressable
                  onPress={() => {
                    onSendMessage?.(message);
                  }}
                  style={{ backgroundColor: theme.tint }}
                  disabled={sending}
                  className="mt-4 py-3 rounded-full items-center"
                >
                  {sending ? (
                    <View className="flex-row items-center justify-center">
                      <Text className="text-white font-medium mr-2">
                        Sending
                      </Text>
                      <ActivityIndicator color="white" />
                    </View>
                  ) : (
                    <Text className="text-white font-medium">Send message</Text>
                  )}
                </Pressable>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default MoodInsightModal;
