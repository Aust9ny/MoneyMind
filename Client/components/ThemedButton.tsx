import { Pressable, useColorScheme } from "react-native";
import { ThemedText } from "./ThemedText";
import { ReactNode } from "react";
import * as Localization from "expo-localization";
import { ThemedView } from "./ThemedView";
import AntDesign from "@expo/vector-icons/AntDesign";

type ThemedButtonProps = {
  mode?: "normal" | "cancel" | "confirm";
  children: ReactNode;
  className?: string;
  textClassName?: string;
  isLoading?: boolean;
  onPress?: () => void;
  [key: string]: any;
};

export function ThemedButton({
  mode = "normal",
  children,
  className,
  textClassName,
  isLoading,
  onPress,
  ...props
}: ThemedButtonProps) {
  // const { theme } = useTheme();
  const theme = useColorScheme();
  // console.log("theme: ",theme);

  const locales = Localization.getLocales();
  const currentLanguage = locales[0]?.languageCode;
  const fontFamily = currentLanguage === "th" ? "NotoSansThai" : "Prompt";

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={
        `${
          mode === "normal"
            ? "bg-[#B1A7A6]"
            : mode === "cancel"
            ? "bg-[#C93540]"
            : mode === "confirm"
            ? "bg-[#2B9348]"
            : ""
        } rounded-[25px] active:scale-110 transition-all duration-75 ease-out justify-center items-center flex-row ${
          isLoading ? "opacity-50" : ""
        }` + (className ? ` ${className}` : "")
      }
      {...props}
    >
      <ThemedText
        // style={{ fontFamily }}
        className={`text-center font-bold text-[#F2F2F2] ${textClassName} ${
          isLoading ? "mr-2" : ""
        }`}
      >
        {children}
      </ThemedText>
      {isLoading && (
        <ThemedView className="animate-spin-ease w-fit h-fit bg-transparent">
          <AntDesign name="loading2" size={24} color={"#F2F2F2"} />
        </ThemedView>
      )}
    </Pressable>
  );
}
