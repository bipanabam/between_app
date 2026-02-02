import { Text, View } from "react-native";

const ChatBubble = ({
  text,
  mine,
}: {
  text: string;
  mine?: boolean;
}) => {
  return (
    <View
      className={`max-w-[80%] rounded-3xl px-5 py-4 mb-3 ${
        mine ? "bg-[#DDE3E6] self-end" : "bg-[#E9DFDB] self-start"
      }`}
    >
      <Text className="text-foreground text-base leading-6">{text}</Text>
    </View>
  );
};


export default ChatBubble;
