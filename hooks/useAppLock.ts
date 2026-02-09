import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export const useAppLockIgnore = (
  userPasscodeHash: string | undefined,
  lockCallback: () => void,
) => {
  const previousState = useRef(AppState.currentState);
  const ignoreNextAppState = useRef(false);

  const startIgnoringAppState = () => {
    ignoreNextAppState.current = true;
  };

  const stopIgnoringAppState = () => {
    setTimeout(() => {
      ignoreNextAppState.current = false;
    }, 300); // small buffer
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        !ignoreNextAppState.current &&
        previousState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        if (userPasscodeHash) lockCallback();
      }
      previousState.current = nextState;
    });

    return () => subscription.remove();
  }, [userPasscodeHash]);

  return { startIgnoringAppState, stopIgnoringAppState };
};
