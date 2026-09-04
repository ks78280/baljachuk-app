import React from "react";
import { useRouter } from "expo-router";
import WishlistScreen from "../src/screens/WishlistScreen";

export default function WishlistRoute() {
  const router = useRouter();
  return (
    <WishlistScreen
      userId="me"
      onBack={() => router.back()}
      onOpenRecord={(id) => router.push(`/record/${id}`)}
    />
  );
}
