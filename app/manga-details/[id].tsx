import { useQuery, useQueryClient } from "@tanstack/react-query";
import { View, Text } from "../../components/Themed";
import {
  ActivityIndicator,
  Image,
  LayoutRectangle,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import { getManga, getMangaChapters } from "../../services/manga.service";
import { Stack, useGlobalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import type { ChaptersData, MangasData } from "../../services/manga.interfaces";
import { useState, useEffect, useCallback, useRef, RefObject } from "react";
import { getData, storeData } from "../../utils/storage";
import { TextInput } from "react-native-gesture-handler";
import { IconCircleCheck, IconSearch } from "tabler-icons-react-native";
import Colors from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MangaDetails() {
  const { colorScheme } = useColorScheme();
  const params = useGlobalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await AsyncStorage.multiRemove([
      `@Manga/${params.id}`,
      `@MangaChapters/${params.id}`,
    ]);

    await queryClient.invalidateQueries({
      queryKey: ["manga"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["mangaChapters"],
    });

    setRefreshing(false);
  }, []);

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
      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Description />
        <ChaptersList scrollRef={scrollRef} />
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

interface ChaptersListProps {
  scrollRef: RefObject<ScrollView>;
}
function ChaptersList({ scrollRef }: ChaptersListProps) {
  const params = useGlobalSearchParams();
  const { data, isLoading } = useGetMangaChapters(params);
  const { colorScheme: theme } = useColorScheme() ?? "light";
  const [search, setSearch] = useState("");
  const viewRef = useRef<LayoutRectangle>(null);
  const searchStyles = StyleSheet.create({
    inputContainer: {
      backgroundColor: Colors[theme].background,
    },
    input: {
      color: Colors[theme].text,
    },
  });

  const filteredData =
    (search
      ? data?.filter((chapter) => chapter.title.includes(search)).sort()
      : data?.slice().reverse()) ?? [];

  const handleSearchFocus = () => {
    scrollRef.current?.scrollTo({ y: viewRef.current?.y });
  };

  return isLoading ? (
    <ActivityIndicator size="large" color={Colors.brand} />
  ) : !data ? (
    <View>
      <Text className="text-center">Erro</Text>
    </View>
  ) : (
    <View
      className="mb-12 mt-4 rounded-sm bg-support-700 p-4"
      onLayout={(event) => (viewRef.current = event.nativeEvent.layout)}
    >
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
            onChangeText={setSearch}
            onFocus={handleSearchFocus}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-4 bg-transparent">
        <View className="min-w-[150px] grow bg-transparent">
          {filteredData
            .slice(0, Math.ceil(filteredData.length / 2))
            .map((chapter) => (
              <ListItem key={chapter.id} chapter={chapter} />
            ))}
        </View>

        <View className="min-w-[150px] grow bg-transparent">
          {filteredData
            .slice(Math.ceil(filteredData.length / 2), filteredData.length)
            .map((chapter) => (
              <ListItem key={chapter.id} chapter={chapter} />
            ))}
        </View>
      </View>
    </View>
  );
}

interface ListItem {
  chapter: ChaptersData;
}
function ListItem({ chapter }: ListItem) {
  const router = useRouter();
  const [wasRead, setWasRead] = useState(false);

  const checkIfRead = async () => {
    const wasRead = (await getData(
      `@ChapterRead/${chapter.manga}/${chapter.id}`,
    )) as string;

    if (!wasRead) return;

    setWasRead(true);
  };

  useEffect(() => {
    checkIfRead();
  }, []);

  return (
    <Pressable
      className="my-2 flex-row items-center justify-between rounded bg-support-900 p-2"
      onPress={() => {
        router.push({
          pathname: `/reader/${chapter.id}`,
          params: { title: chapter.title },
        });
      }}
    >
      <View>
        <Text>{chapter.title}</Text>
        <Text className="text-xs text-support-200">
          {new Date(chapter.update_at).toLocaleDateString()}
        </Text>
      </View>
      <View>
        <IconCircleCheck
          className={
            (wasRead ? "bg-success-500" : "bg-support-200") + " rounded-full"
          }
        />
      </View>
    </Pressable>
  );
}

function useGetMangaDetails(params: Record<string, string | string[]>) {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<MangasData>();
  const {
    data: response,
    isLoading,
    isRefetching,
  } = useQuery({
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
    isLoading: isLoading || isRefetching,
  };
}

function useGetMangaChapters(params: Record<string, string | string[]>) {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<ChaptersData[]>();
  const {
    data: response,
    isLoading,
    isRefetching,
  } = useQuery({
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
    isLoading: isLoading || isRefetching,
  };
}
