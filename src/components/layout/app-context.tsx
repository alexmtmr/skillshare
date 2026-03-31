"use client";

import { createContext, useContext } from "react";

interface AppContextValue {
  isAdmin: boolean;
}

const AppContext = createContext<AppContextValue>({ isAdmin: false });

export function AppProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <AppContext.Provider value={{ isAdmin }}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
