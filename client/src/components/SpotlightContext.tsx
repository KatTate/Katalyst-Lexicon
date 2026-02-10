import { createContext, useContext } from "react";

interface SpotlightContextValue {
  openSpotlight: () => void;
}

const SpotlightContext = createContext<SpotlightContextValue>({
  openSpotlight: () => {},
});

export const SpotlightProvider = SpotlightContext.Provider;

export function useSpotlight() {
  return useContext(SpotlightContext);
}
