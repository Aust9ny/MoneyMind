import { useFonts } from "expo-font";
import React, { useEffect, useContext } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Localization from "expo-localization";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { TermsProvider } from "@/hooks/conText/TermsConText";
import { ServerProvider } from "@/hooks/conText/ServerConText";
import { AuthProvider, AuthContext } from "@/hooks/conText/AuthContext";
import "@/global.css";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { UserProvider } from "@/hooks/conText/UserContext";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    Prompt: require("@/assets/fonts/Prompt-Regular.ttf"),
    NotoSansThai: require("@/assets/fonts/NotoSansThai-VariableFont_wdth,wght.ttf"),
  });
  const locales = Localization.getLocales();
  const currentLanguage = locales[0]?.languageCode;

  const fontFamily = currentLanguage === "th" ? "NotoSansThai" : "Prompt";

  const auth = useContext(AuthContext);

  const theme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ServerProvider>
      <AuthProvider>
        <UserProvider>
          <TermsProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme === "dark" ? "#2F2F2F" : "#E5E5E5",
                },
                headerTintColor: theme === "dark" ? "#E5E5E5" : "#2F2F2F",
                headerTitleStyle: {
                  fontFamily,
                },
                animation: "slide_from_bottom",
                headerBackTitle: "back",
              }}
            >
              <Stack.Screen
                name="index"
                options={{ headerShown: false, animation: "none" }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animation: "none",
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="SignUp"
                options={{ headerShown: false, animation: "slide_from_left" }}
              />
              <Stack.Screen
                name="SignIn"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />

              <Stack.Screen
                name="terms_and_con"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  headerTitle: "Terms and Conditions",
                }}
              />
              <Stack.Screen name="OTP" options={{ headerShown: false }} />
              <Stack.Screen
                name="Add_Transaction"
                options={{ title: "Add Your Transaction" }}
              />
              <Stack.Screen
                name="AddAccount"
                options={{ headerTitle: "Add Account", presentation: "modal" }}
              />
              <Stack.Screen name="PinPage" options={{ headerShown: false }} />
              <Stack.Screen
                name="CreatePinPage"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Welcome"
                options={{ headerShown: false, animation: "none" }}
              />

              <Stack.Screen
                name="NotificationPage"
                options={{ headerTitle: "Notification", presentation: "modal" }}
              />
              <Stack.Screen
                name="PinRecovery"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PinRecovery2"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Edit_Transaction"
                options={{
                  headerTitle: "Edit Transaction",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="Edit_Account"
                options={{ headerTitle: "Edit Account", presentation: "modal" }}
              />
              <Stack.Screen
                name="Month_Summary"
                options={{
                  headerTitle: "Monthly Summary",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="Retire_form"
                options={{
                  headerTitle: "Retire",
                  presentation: "modal",
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="NewPassword1"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Account_Detail"
                options={{
                  headerTitle: "Account Detail",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="NotificationSetting"
                options={{
                  headerTitle: "Notification Settings",
                  // presentation: "modal",
                }}
              />
              <Stack.Screen
                name="IconTransaction"
                options={{
                  headerTitle: "Icon Transaction",
                  presentation: "modal",
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </TermsProvider>
        </UserProvider>
      </AuthProvider>
    </ServerProvider>
  );
}
