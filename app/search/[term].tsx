import { Stack, useGlobalSearchParams } from "expo-router";
import { View, Text } from "../../components/Themed";
import MangaCard from "../../components/MangaCard";
import { ScrollView, ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";
import Colors from "../../constants/Colors";
import { useQuery } from "@tanstack/react-query";
import { getSearchMangas } from "../../services/manga.service";
import { FlatList } from "react-native-gesture-handler";
import SearchBar from "../../components/SearchBar";

export default function Search() {
  const { term } = useGlobalSearchParams();
  const { colorScheme } = useColorScheme();

  const { data, isLoading } = useQuery({
    queryKey: ["search", term],
    queryFn: () => getSearchMangas(term as string),
  });

  return (
    <View className="flex-1 px-2 pt-4">
      <Stack.Screen
        options={{
          title: "Busca",
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        }}
      />

      <SearchBar value={term as string} />

      {isLoading ? (
        <ActivityIndicator className="mt-4" size="large" color={Colors.brand} />
      ) : !data?.data?.length ? (
        <View className="mt-4">
          <Text className="text-center">Erro</Text>
        </View>
      ) : (
        <FlatList
          className="mt-4"
          data={data.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return <MangaCard data={item} />;
          }}
        />
      )}
    </View>
  );
}
