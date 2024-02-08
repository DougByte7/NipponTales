import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { IconArrowUp } from "tabler-icons-react-native";
import { Text, View } from "../components/Themed";
import { getLatestMangas, getMangas } from "../services/manga.service";
import { MangasData, MangasResponse } from "../services/manga.interfaces";
import Colors from "../constants/Colors";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import useStorageQuery from "../hooks/useStorageQuery";
import MangaCard from "../components/MangaCard";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const [affixVisible, setAffixVisible] = useState(false);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setAffixVisible(e.nativeEvent.contentOffset.y > 400);
  };

  return (
    <View className="relative flex-1 items-center">
      <ScrollView ref={scrollRef} className="w-full" onScroll={handleScroll}>
        <SearchBar />
        <Trending />
        <NewReleases />
      </ScrollView>
      <Affix scrollRef={scrollRef.current} visible={affixVisible} />
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar
        style={Platform.OS === "ios" ? "light" : "auto"}
        backgroundColor={"transparent"}
        translucent
      />
    </View>
  );
}

function Trending() {
  const { data, isLoading } = useStorageQuery<MangasResponse, MangasData[]>({
    storageKey: "@Mangas",
    queryKey: ["mangas"],
    queryFn: () => getMangas(1),
  });

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
            return <MangaFeaturedCard data={data.item} />;
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
function MangaFeaturedCard({ data }: MangaCardProps) {
  const router = useRouter();

  return (
    <Pressable
      className="m-2 rounded-xl bg-secondary transition-colors active:bg-amber-100 dark:bg-support-700 dark:active:bg-support-600"
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
  const { data, isLoading } = useStorageQuery<MangasResponse, MangasData[]>({
    storageKey: "@Latest",
    queryKey: ["latest"],
    queryFn: () => getLatestMangas(1),
  });

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
            return <MangaCard key={item.id} data={item} />;
          })}
        </View>
      )}
    </View>
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
