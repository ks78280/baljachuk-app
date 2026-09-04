import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChatScreen from "../../src/screens/ChatScreen";

export default function ChatRoute() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  return (
    <ChatScreen
      conversationId={id}
      title={name ?? "대화"}
      onBack={() => router.back()}
    />
  );
}
