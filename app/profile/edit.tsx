import React from "react";
import { useRouter } from "expo-router";
import ProfileEditScreen from "../../src/screens/ProfileEditScreen";

export default function ProfileEditRoute() {
  const router = useRouter();
  return <ProfileEditScreen onBack={() => router.back()} />;
}
