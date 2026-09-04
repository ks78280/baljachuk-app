import React from "react";
import { useRouter } from "expo-router";
import NotificationScreen from "../src/screens/NotificationScreen";

export default function NotificationsRoute() {
  const router = useRouter();
  return (
    <NotificationScreen
      onBack={() => router.back()}
      onOpenRecord={(recordId) => router.push(`/record/${recordId}`)}
    />
  );
}
