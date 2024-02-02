import { useQuery } from "@tanstack/react-query";
import { View, Text } from "../../components/Themed";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { getManga, getMangaChapters } from "../../services/manga.service";
import { Stack, useGlobalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import type { ChaptersData, MangasData } from "../../services/manga.interfaces";
import { useState, useEffect } from "react";
import { getData, storeData } from "../../utils/storage";
import { TextInput } from "react-native-gesture-handler";
import { IconSearch } from "tabler-icons-react-native";
import Colors from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MangaDetails() {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 px-2 pt-4">
      <Stack.Screen
        options={{
          title: "Detalhes",
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        }}
      />
      <ScrollView>
        <Description />
        <ChaptersList />
      </ScrollView>
    </View>
  );
}

function Description() {
  const params = useGlobalSearchParams();
  const { data, isLoading } = useGetMangaDetails(params);

  return isLoading ? (
    <ActivityIndicator size="large" color={Colors.brand} />
  ) : !data ? (
    <View>
      <Text className="text-center">Erro</Text>
    </View>
  ) : (
    <View className="flex-row flex-wrap justify-center gap-4 rounded-sm bg-support-700 p-4">
      <Image
        className="h-52 w-44 rounded-xl bg-black"
        source={{ uri: data.thumb }}
      />
      <View className="bg-transparent">
        <Text
          className="text-center text-xl font-bold md:text-left"
          role="heading"
        >
          {data.title}
        </Text>
        {!!data.authors?.[0] && (
          <Text className="pt-1 text-xs text-support-200">
            by {data.authors?.join(", ")}
          </Text>
        )}
        <Text className="mt-6 max-w-xl">{data.summary}</Text>
      </View>
    </View>
  );
}

function ChaptersList() {
  const params = useGlobalSearchParams();
  const { data, isLoading } = useGetMangaChapters(params);
  const { colorScheme: theme } = useColorScheme() ?? "light";
  const searchStyles = StyleSheet.create({
    inputContainer: {
      backgroundColor: Colors[theme].background,
    },
    input: {
      color: Colors[theme].text,
    },
  });

  return isLoading ? (
    <ActivityIndicator size="large" color={Colors.brand} />
  ) : !data ? (
    <View>
      <Text className="text-center">Erro</Text>
    </View>
  ) : (
    <View className="mb-12 mt-4 rounded-sm bg-support-700 p-4">
      <View className="flex-row items-center justify-between gap-3 bg-transparent">
        <Text className="h-11 text-lg font-bold">Capítulos</Text>
        <View
          className="mb-4 h-14 w-1/2 flex-row items-center rounded-full"
          style={searchStyles.inputContainer}
        >
          <View className="bg-transparent pl-4 pr-2">
            <IconSearch size={32} color={searchStyles.input.color} />
          </View>
          <TextInput
            role="searchbox"
            className="h-full w-full"
            style={searchStyles.input}
            placeholder="Buscar..."
            placeholderTextColor={searchStyles.input.color}
            inputMode="search"
            enterKeyHint="search"
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-4 bg-transparent">
        <View className="min-w-[150px] grow bg-transparent">
          {data.slice(0, Math.ceil(data.length / 2)).map((chapter) => (
            <ListItem key={chapter.id} chapter={chapter} />
          ))}
        </View>
        {data.length > 1 && (
          <View className="min-w-[150px] grow bg-transparent">
            {data
              .slice(Math.ceil(data.length / 2), data.length)
              .map((chapter) => (
                <ListItem key={chapter.id} chapter={chapter} />
              ))}
          </View>
        )}
      </View>
    </View>
  );
}

interface ListItem {
  chapter: ChaptersData;
}
function ListItem({ chapter }: ListItem) {
  console.log(chapter);

  return (
    <Pressable className="bg-support-900 my-2 rounded p-2">
      <Text>{chapter.title}</Text>
      {
        <Text className="text-xs text-support-200">
          {new Date(chapter.update_at).toLocaleDateString()}
        </Text>
      }
    </Pressable>
  );
}

function useGetMangaDetails(params: Record<string, string | string[]>) {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<MangasData>();
  const { data: response, isLoading } = useQuery({
    queryKey: ["manga", params.id],
    queryFn: () => getManga(params.id as string),
    enabled,
  });

  const { data = localData } = response ?? {};

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: MangasData }>(
      `@Manga/${params.id}`,
    );
    const sixHours = 1000 * 60 * 60 * 6;
    if (item && item.updatedAt >= Date.now() - sixHours) {
      setEnabled(false);
      setLocalData(item.data);
      return;
    }

    setEnabled(true);
  };

  const writeItemToStorage = async () => {
    if (!data) return;

    await storeData(`@Manga/${params.id}`, { data, updatedAt: Date.now() });

    setEnabled(false);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  useEffect(() => {
    writeItemToStorage();
  }, [response]);

  return {
    data,
    isLoading,
  };
}

function useGetMangaChapters(params: Record<string, string | string[]>) {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<ChaptersData[]>();
  const { data: response, isLoading } = useQuery({
    queryKey: ["mangaChapters", params.id],
    queryFn: () => getMangaChapters(params.id as string),
    enabled,
  });

  const { data = localData } = response ?? {};

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: ChaptersData[] }>(
      `@MangaChapters/${params.id}`,
    );
    const sixHours = 1000 * 60 * 60 * 6;
    if (item && item.updatedAt >= Date.now() - sixHours) {
      setEnabled(false);
      setLocalData(item.data);
      return;
    }

    setEnabled(true);
  };

  const writeItemToStorage = async () => {
    if (!data) return;

    await storeData(`@Manga/${params.id}`, { data, updatedAt: Date.now() });

    setEnabled(false);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  useEffect(() => {
    writeItemToStorage();
  }, [response]);

  return {
    data,
    isLoading,
  };
}
