import { StatusBar } from "expo-status-bar";
import {
  Platform,
  TextInput,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Dimensions,
} from "react-native";
import { IconArrowUp, IconSearch } from "tabler-icons-react-native";

import { Text, View } from "../components/Themed";
import { useQuery } from "@tanstack/react-query";
import { getLatestMangas, getMangas } from "../services/manga.service";
import { MangasData } from "../services/manga.interfaces";
import Colors from "../constants/Colors";
import { useEffect, useRef, useState } from "react";
import { getData, storeData } from "../utils/storage";
import { useRouter } from "expo-router";

export default function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const [affixVisible, setAffixVisible] = useState(false);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setAffixVisible(e.nativeEvent.contentOffset.y > 400);
  };

  return (
    <View className="relative flex-1 items-center">
      <ScrollView ref={scrollRef} className="w-full" onScroll={handleScroll}>
        <SearchInput />
        <Trending />
        <NewReleases />
      </ScrollView>
      <Affix scrollRef={scrollRef.current} visible={affixVisible} />
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

function SearchInput() {
  const theme = useColorScheme() ?? "light";
  const searchStyles = StyleSheet.create({
    inputContainer: {
      backgroundColor: Colors[theme].contrastBackground,
    },
    input: {
      color: Colors[theme].text,
    },
  });

  return (
    <View className="w-full px-4">
      <View
        className="h-14 flex-row items-center rounded-full"
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
  );
}

function Trending() {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<MangasData[]>();

  const { data: response, isLoading } = useQuery({
    queryKey: ["mangas"],
    queryFn: () => getMangas(1),
    enabled,
  });

  const { data = localData } = response ?? {};

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: MangasData[] }>(
      "@Mangas",
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
    if (!data?.length) return;

    await storeData("@Mangas", { data, updatedAt: Date.now() });

    setEnabled(false);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  useEffect(() => {
    writeItemToStorage();
  }, [response]);

  return (
    <View className="w-full pt-6">
      <Text className="pb-2 pl-4 text-xl">Populares</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.brand} />
      ) : !data ? (
        <View>
          <Text className="text-center">Erro</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          renderItem={(data) => {
            return <MangaCard data={data.item} />;
          }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(data) => data.id}
        />
      )}
    </View>
  );
}

interface MangaCardProps {
  data: MangasData;
}
function MangaCard({ data }: MangaCardProps) {
  const router = useRouter();

  return (
    <Pressable
      className="m-2 rounded-xl bg-brand dark:bg-support-700"
      onPress={() => {
        router.push(`/manga-details/${data.id}`);
      }}
    >
      <Image
        className="h-52 w-44 rounded-xl bg-black"
        source={{ uri: data.thumb }}
      />
      <View className="w-44 flex-1 justify-center bg-transparent p-2">
        <Text className="font-bold" numberOfLines={2}>
          {data.title}
        </Text>
        {!!data.authors?.[0] && (
          <Text className="pt-1 text-xs text-support-200" numberOfLines={1}>
            by {data.authors?.join(", ")}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function NewReleases() {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<MangasData[]>();

  const { data: response, isLoading } = useQuery({
    queryKey: ["latest"],
    queryFn: () => getLatestMangas(1),
    enabled,
  });

  const { data = localData } = response ?? {};

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: MangasData[] }>(
      "@Latest",
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
    if (!data?.length) return;

    await storeData("@Latest", { data, updatedAt: Date.now() });

    setEnabled(false);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  useEffect(() => {
    writeItemToStorage();
  }, [response]);

  return (
    <View className="mb-8 w-full pt-6">
      <Text className="pb-2 pl-4 text-xl">Novidades</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.brand} />
      ) : !data ? (
        <View>
          <Text className="text-center">Erro</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap">
          {data.map((item) => {
            return <MangaUpdated key={item.id} data={item} />;
          })}
        </View>
      )}
    </View>
  );
}

interface MangaUpdatedProps {
  data: MangasData;
}
function MangaUpdated({ data }: MangaUpdatedProps) {
  const router = useRouter();

  return (
    <Pressable
      style={{ minWidth: Dimensions.get("window").width / 2 - 16, margin: 8 }}
      onPress={() => {
        router.push(`/manga-details/${data.id}`);
      }}
    >
      <View className="flex-row rounded-xl bg-red-500 dark:bg-support-700">
        <Image
          className="mr-2 h-28 w-24 rounded-xl bg-black"
          source={{ uri: data.thumb }}
        />
        <View className="justify-between bg-transparent py-1">
          <View className="bg-transparent">
            <Text className="w-60 font-bold" numberOfLines={3}>
              {data.title}
            </Text>
            <Text className="text-sm">{data.total_chapter} capítulos</Text>
          </View>

          <View className="bg-transparent">
            {!!data.authors?.[0] && (
              <Text className="pt-1 text-xs text-support-200" numberOfLines={1}>
                by {data.authors?.join(", ")}
              </Text>
            )}
            <Text className="text-xs text-support-200">
              {new Date(data.update_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface AffixProps {
  scrollRef: ScrollView | null;
  visible: boolean;
}
function Affix({ scrollRef, visible }: AffixProps) {
  const handleBackToTop = () => {
    scrollRef?.scrollTo({ y: 0 });
  };

  return (
    visible && (
      <Pressable
        className="absolute bottom-4 right-4 h-14 w-14 items-center justify-center rounded-full bg-brand"
        onPress={handleBackToTop}
      >
        <IconArrowUp color="white" />
      </Pressable>
    )
  );
}
