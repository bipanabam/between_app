import { Text, View } from "react-native";

const ChatBubble = ({
  text,
  left,
  right,
}: {
  text: string;
  left?: boolean;
  right?: boolean;
}) => {
  const isLeft = left;

  return (
    <View
      className={`max-w-[80%] rounded-3xl px-5 py-4 mb-3 ${
        isLeft ? "bg-[#E9DFDB] self-start" : "bg-[#DDE3E6] self-end"
      }`}
    >
      <Text className="text-foreground text-base leading-6">{text}</Text>
    </View>
  );
};

export default ChatBubble;
