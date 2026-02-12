import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#bc8f97",
        backgroundColor: "#faf8f8",
        borderRadius: 16,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#3b2f33",
      }}
      text2Style={{
        fontSize: 12,
        color: "#6b5b60",
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#d66",
        borderRadius: 16,
      }}
      text1Style={{ fontSize: 14, fontWeight: "600" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
};
