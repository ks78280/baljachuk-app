import React from "react";
import { useRouter } from "expo-router";
import MessagesScreen from "../src/screens/MessagesScreen";

export default function MessagesRoute() {
  const router = useRouter();
  return (
    <MessagesScreen
      onBack={() => router.back()}
      onOpenChat={(id, name) =>
        router.push(`/chat/${id}?name=${encodeURIComponent(name)}`)
      }
    />
  );
}
