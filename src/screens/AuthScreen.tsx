import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../lib/auth";
import { USE_MOCK } from "../api/client";
import { ApiRequestError } from "../types/api";
import { useKeyboardHeight } from "../lib/useKeyboard";

type Mode = "signin" | "signup";

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="mb-3.5">
      <Text className="text-[12px] font-bold text-ink-muted mb-1.5">{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#B99287"
        className="bg-white border border-border rounded-xl px-4 py-3 text-[15px] text-ink"
      />
    </View>
  );
}

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const kb = useKeyboardHeight();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const pwOk = password.length >= 6;
  const nickOk = !isSignup || nickname.trim().length >= 2;
  const canSubmit = emailOk && pwOk && nickOk && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (isSignup)
        await signUp({ email: email.trim(), password, nickname: nickname.trim() });
      else await signIn(email.trim(), password);
      // 성공하면 AuthGate 가 자동으로 홈으로 보낸다
    } catch (e) {
      setError(
        e instanceof ApiRequestError
          ? e.message
          : "요청에 실패했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 28,
          paddingBottom: 28 + kb,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 로고 / 타이틀 */}
        <View className="items-center mb-9">
          <View className="w-16 h-16 rounded-2xl bg-coral items-center justify-center mb-3">
            <Text className="text-3xl">📍</Text>
          </View>
          <Text className="text-2xl font-black text-ink">TriPin</Text>
          <Text className="text-[13px] text-ink-muted mt-1">여행지를 핀으로 남기는 지도</Text>
        </View>

        {/* 로그인 / 회원가입 토글 */}
        <View className="flex-row bg-white border border-border rounded-full p-1 mb-6">
          {(
            [
              ["signin", "로그인"],
              ["signup", "회원가입"],
            ] as const
          ).map(([key, label]) => {
            const on = mode === key;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setMode(key);
                  setError(null);
                }}
                className="flex-1 py-2 rounded-full items-center"
                style={on ? { backgroundColor: "#FF6B45" } : undefined}
              >
                <Text
                  className={`text-[13px] font-bold ${on ? "text-white" : "text-ink-muted"}`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isSignup && (
          <Field
            label="닉네임"
            value={nickname}
            onChangeText={setNickname}
            placeholder="2자 이상"
            autoCapitalize="none"
            returnKeyType="next"
          />
        )}
        <Field
          label="이메일"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
        />
        <Field
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder="6자 이상"
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {error && (
          <Text className="text-[13px] text-coral-dark mb-3">{error}</Text>
        )}

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          className="rounded-xl py-3.5 items-center mt-1"
          style={{ backgroundColor: canSubmit ? "#FF6B45" : "#F0C7B7" }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-[15px]">
              {isSignup ? "가입하고 시작하기" : "로그인"}
            </Text>
          )}
        </Pressable>

        {USE_MOCK && (
          <Text className="text-[11px] text-ink-muted text-center mt-3">
            목 모드 — 형식만 맞으면 아무 값이나 통과합니다
          </Text>
        )}

        {/* 소셜 로그인 (2차) */}
        <View className="flex-row items-center gap-3 my-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-[11px] text-ink-muted">또는</Text>
          <View className="flex-1 h-px bg-border" />
        </View>
        <Pressable
          disabled
          className="rounded-xl py-3.5 items-center"
          style={{ backgroundColor: "#FEE500", opacity: 0.45 }}
        >
          <Text className="text-[14px] font-bold text-[#3C1E1E]">
            카카오로 계속하기 (준비 중)
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
