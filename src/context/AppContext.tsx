import React, { createContext, useContext, useState } from "react";
import type { Tournament } from "../types";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  registeredTournaments: string[];
  registerForTournament: (tournamentId: string) => void;
  isRegistered: (tournamentId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>(
    []
  );

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const registerForTournament = (tournamentId: string) => {
    if (registeredTournaments.includes(tournamentId)) {
      addNotification({
        id: Date.now().toString(),
        type: "info",
        message: "Already registered for this tournament",
      });
      return;
    }

    setRegisteredTournaments((prev) => [...prev, tournamentId]);
    addNotification({
      id: Date.now().toString(),
      type: "success",
      message: "Successfully registered for tournament",
    });
  };

  const isRegistered = (tournamentId: string) => {
    return registeredTournaments.includes(tournamentId);
  };

  return (
    <AppContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        registeredTournaments,
        registerForTournament,
        isRegistered,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
