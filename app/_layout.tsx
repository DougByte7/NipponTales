import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Image, Linking, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { Text } from "../components/Themed";

import Colors from "../constants/Colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IconMoon, IconSunHigh } from "tabler-icons-react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: "Home",
                headerRight: () => (
                  <Pressable onPress={toggleColorScheme}>
                    {colorScheme === "dark" ? (
                      <IconSunHigh color={Colors[colorScheme].text} />
                    ) : (
                      <IconMoon />
                    )}
                  </Pressable>
                ),
                headerTitle: () => (
                  <>
                    <Image
                      className="h-16 w-16"
                      source={require("../assets/images/logo.png")}
                    />
                    <Pressable
                      className="flex-row items-center rounded-full bg-brand px-4 py-2"
                      onPress={() => {
                        const kofiUrl = "https://ko-fi.com/dougbyte";
                        Linking.canOpenURL(kofiUrl).then((supported) =>
                          supported
                            ? Linking.openURL(kofiUrl)
                            : console.error("Can not open Kofi URL"),
                        );
                      }}
                    >
                      <Image
                        className="h-4 w-6"
                        source={require("../assets/images/cup-border.webp")}
                      />
                      <Text className="ml-2 font-bold text-support-100">
                        Quero um Cafééé!!
                      </Text>
                    </Pressable>
                  </>
                ),
                headerShadowVisible: false,
                headerTitleAlign: "center",
                headerStyle: {
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
