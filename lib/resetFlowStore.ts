import * as SecureStore from "expo-secure-store";

const KEY = "between_reset_flow";

export async function saveResetFlow(data: any) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(data));
}

export async function loadResetFlow() {
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearResetFlow() {
  await SecureStore.deleteItemAsync(KEY);
}
