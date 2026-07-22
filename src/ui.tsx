import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { T, FONT, MONO, CYAN_GRAD } from "./theme";

/* ============================================================
   Shared native UI kit — the reusable primitives that stand in
   for the web build's inline CSS (Card / Pill / Chip / Input …).
   ============================================================ */

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.label, style]}>{children}</Text>;
}

type PillVariant = "gradient" | "outline" | "dashed";
export function Pill({
  label,
  icon,
  iconRight,
  onPress,
  variant = "gradient",
  color,
  style,
  textStyle,
  disabled,
}: {
  label?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onPress?: () => void;
  variant?: PillVariant;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}) {
  const fg = color ?? (variant === "gradient" ? T.ink : T.cyan);
  const content = (
    <View style={s.pillRow}>
      {icon}
      {label ? <Text style={[s.pillText, { color: fg }, textStyle]}>{label}</Text> : null}
      {iconRight}
    </View>
  );

  const a11y = { accessibilityRole: "button" as const, accessibilityLabel: label, accessibilityState: { disabled: !!disabled } };

  if (variant === "gradient") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        {...a11y}
        style={[s.pillBase, { overflow: "hidden" }, style, disabled && { opacity: 0.4 }]}
      >
        <LinearGradient colors={CYAN_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      {...a11y}
      style={[
        s.pillBase,
        {
          backgroundColor: variant === "outline" ? T.card : "transparent",
          borderWidth: 1,
          borderColor: T.line,
          borderStyle: variant === "dashed" ? "dashed" : "solid",
        },
        style,
        disabled && { opacity: 0.4 },
      ]}
    >
      {content}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  activeColor = T.cyan,
  onPress,
  icon,
  style,
}: {
  label: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={[s.chip, { backgroundColor: active ? activeColor : T.card }, style]}
    >
      {icon}
      <Text style={[s.chipText, { color: active ? T.ink : T.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  numeric,
  maxLength,
  autoFocus,
  style,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  numeric?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const keyboardType: KeyboardTypeOptions | undefined = numeric ? "decimal-pad" : undefined;
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={T.sub}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoFocus={autoFocus}
      style={[s.input, style]}
    />
  );
}

export function Tag({ children, color = T.cyan }: { children: React.ReactNode; color?: string }) {
  return (
    <View style={[s.tag, { borderColor: color + "44" }]}>
      <Text style={[s.tagText, { color }]}>{children}</Text>
    </View>
  );
}

export function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <View>
      <View style={s.statRow}>
        {icon}
        <Text style={s.statLabel}>{label}</Text>
      </View>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

export function ToolHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={s.toolHeader}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={s.iconBtn}>
        <ArrowLeft size={19} color={T.text} />
      </Pressable>
      <Text style={[s.toolTitle, { flex: 1 }]}>{title}</Text>
      {right}
    </View>
  );
}

/* An icon-only round button (the web `iconBtn`). */
export function IconButton({
  onPress,
  children,
  style,
  accessibilityLabel,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[s.iconBtn, style]}
    >
      {children}
    </Pressable>
  );
}

export const s = StyleSheet.create({
  card: {
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: T.sub,
    fontFamily: MONO,
    fontWeight: "500",
  },
  pillBase: {
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pillText: {
    fontWeight: "600",
    fontSize: 13,
    fontFamily: FONT,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: T.line,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: FONT,
  },
  input: {
    width: "100%",
    backgroundColor: "#0a2731",
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: T.text,
    fontSize: 14,
    fontFamily: FONT,
  },
  tag: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10.5,
    fontFamily: MONO,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statLabel: {
    color: T.sub,
    fontSize: 11,
    fontFamily: MONO,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
    color: T.text,
  },
  toolHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: T.text,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
