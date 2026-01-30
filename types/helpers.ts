import * as Crypto from "expo-crypto";

export const hashPasscode = async (code: string) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    code,
  );
};
