import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const registerForPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();

  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Between App",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return token.data;
};
