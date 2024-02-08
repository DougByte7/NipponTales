import { useRouter } from "expo-router";
import { MangasData } from "../services/manga.interfaces";
import { Pressable, Dimensions, Image } from "react-native";
import { View, Text } from "./Themed";

interface MangaCardProps {
  data: MangasData;
}
export default function MangaCard({ data }: MangaCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={{ minWidth: Dimensions.get("window").width / 2 - 16, margin: 8 }}
      onPress={() => {
        router.push(`/manga-details/${data.id}`);
      }}
    >
      <View className="flex-row rounded-xl bg-secondary dark:bg-support-700">
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
