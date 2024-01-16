import { StatusBar } from "expo-status-bar"
import {
  Platform,
  TextInput,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native"
import { IconSearch } from "tabler-icons-react-native"

import { Text, View } from "../components/Themed"
import { ScrollView } from "react-native-gesture-handler"
import { useQuery } from "@tanstack/react-query"
import { getLatestMangas, getMangas } from "../services/manga.service"
import { MangasData } from "../services/manga.interfaces"

export default function ModalScreen() {
  const { data: mangas, isLoading: isMangasLoading } = useQuery({
    queryKey: ["mangas"],
    queryFn: () => getMangas(1),
  })

  const { data: latestMangas, isLoading: isLatestMangasLoading } = useQuery({
    queryKey: ["latest"],
    queryFn: () => getLatestMangas(1),
  })

  return (
    <View className="flex-1 items-center">
      <ScrollView className="w-full">
        <SearchInput />
        <Trending data={mangas?.data} isLoading={isMangasLoading} />
        <NewReleases
          data={latestMangas?.data}
          isLoading={isLatestMangasLoading}
        />
      </ScrollView>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  )
}

function SearchInput() {
  return (
    <View className="px-4 w-full">
      <View className="flex flex-row h-14 items-center bg-[#788196] rounded-full">
        <View className="pl-4 pr-2 bg-transparent">
          <IconSearch size={32} color="#1D1A31" />
        </View>
        <TextInput className="w-full h-full " placeholder="Buscar..." />
      </View>
    </View>
  )
}

interface TrendingProps {
  data: MangasData[] | Nill
  isLoading: boolean
}
function Trending({ data, isLoading }: TrendingProps) {
  return (
    <View className="pt-6 w-full">
      <Text className="text-xl pb-2 pl-4">Populares</Text>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : !data ? (
        <View>
          <Text>Erro</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          renderItem={(data) => {
            return <MangaCard data={data.item} />
          }}
          keyExtractor={(data) => data.id}
        />
      )}
    </View>
  )
}

interface MangaCardProps {
  data: MangasData
}
function MangaCard({ data }: MangaCardProps) {
  return (
    <Pressable className="m-2">
      <Image
        className="w-44 h-52 bg-black rounded-xl"
        source={{ uri: data.thumb }}
      />
      <Text className="pt-3 font-bold w-44">{data.title}</Text>
      <Text className="pt-1 text-xs w-44">by {data.authors?.join(", ")}</Text>
    </Pressable>
  )
}

interface TrendingProps {
  data: MangasData[] | Nill
  isLoading: boolean
}
function NewReleases({ data, isLoading }: TrendingProps) {
  return (
    <View className="pt-6 w-full">
      <Text className="text-xl pb-2 pl-4">Novidades</Text>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : !data ? (
        <View>
          <Text>Erro</Text>
        </View>
      ) : (
        data.map((item) => {
          return <MangaUpdated key={item.id} data={item} />
        })
      )}
    </View>
  )
}

interface MangaUpdatedProps {
  data: MangasData
}
function MangaUpdated({ data }: MangaUpdatedProps) {
  return (
    <Pressable className="m-2">
      <View className="flex-row">
        <Image
          className="mr-2 w-24 h-28 bg-black rounded-xl"
          source={{ uri: data.thumb }}
        />
        <View className="justify-between">
          <View>
            <Text className="pt-3 font-bold">{data.title}</Text>
            <Text className="pt-1 text-xs">by {data.authors?.join(", ")}</Text>
          </View>
          <Text className="pb-4">Capítulo 120</Text>
        </View>
      </View>
    </Pressable>
  )
}
