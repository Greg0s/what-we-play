import { useContext } from "react";
import { ReliefContext, type ReliefContextValue } from "./context";

export function useRelief(): ReliefContextValue {
  const context = useContext(ReliefContext);

  if (!context) {
    throw new Error("useRelief must be used inside a <ReliefProvider>");
  }

  return context;
}
