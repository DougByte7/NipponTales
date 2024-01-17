import { StatusBar } from "expo-status-bar"
import {
  Platform,
  TextInput,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
} from "react-native"
import { IconSearch } from "tabler-icons-react-native"

import { Text, View } from "../components/Themed"
import { ScrollView } from "react-native-gesture-handler"
import { useQuery } from "@tanstack/react-query"
import { getLatestMangas, getMangas } from "../services/manga.service"
import { MangasData } from "../services/manga.interfaces"
import Colors from "../constants/Colors"
import { useEffect, useState } from "react"
import { getData, storeData } from "../utils/storage"

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center">
      <ScrollView className="w-full">
        <SearchInput />
        <Trending />
        <NewReleases />
      </ScrollView>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  )
}

function SearchInput() {
  const theme = useColorScheme() ?? "light"
  const searchStyles = StyleSheet.create({
    inputContainer: {
      backgroundColor: Colors[theme].inputBackground,
    },
    input: {
      color: Colors[theme].inputText,
    },
  })

  return (
    <View className="px-4 w-full">
      <View
        className="flex-row h-14 items-center rounded-full"
        style={searchStyles.inputContainer}
      >
        <View className="pl-4 pr-2 bg-transparent">
          <IconSearch size={32} color={searchStyles.input.color} />
        </View>
        <TextInput
          role="searchbox"
          className="w-full h-full"
          style={searchStyles.input}
          placeholder="Buscar..."
          placeholderTextColor={searchStyles.input.color}
          inputMode="search"
          enterKeyHint="search"
        />
      </View>
    </View>
  )
}

function Trending() {
  const [enabled, setEnabled] = useState(false)
  const [localData, setLocalData] = useState<MangasData[]>()

  const { data: response, isLoading } = useQuery({
    queryKey: ["mangas"],
    queryFn: () => getMangas(1),
    enabled,
  })

  const { data = localData } = response ?? {}

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: MangasData[] }>(
      "@Mangas"
    )
    const sixHours = 1000 * 60 * 60 * 6
    if (item && item.updatedAt >= Date.now() - sixHours) {
      setEnabled(false)
      setLocalData(item.data)
      return
    }

    setEnabled(true)
  }

  const writeItemToStorage = async () => {
    if (!data?.length) return

    await storeData("@Mangas", { data, updatedAt: Date.now() })

    setEnabled(false)
  }

  useEffect(() => {
    readItemFromStorage()
  }, [])

  useEffect(() => {
    writeItemToStorage()
  }, [response])

  return (
    <View className="pt-6 w-full">
      <Text className="text-xl pb-2 pl-4">Populares</Text>

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

function NewReleases() {
  const [enabled, setEnabled] = useState(false)
  const [localData, setLocalData] = useState<MangasData[]>()

  const { data: response, isLoading } = useQuery({
    queryKey: ["latest"],
    queryFn: () => getLatestMangas(1),
    enabled,
  })

  const { data = localData } = response ?? {}

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: MangasData[] }>(
      "@Latest"
    )
    const sixHours = 1000 * 60 * 60 * 6
    if (item && item.updatedAt >= Date.now() - sixHours) {
      setEnabled(false)
      setLocalData(item.data)
      return
    }

    setEnabled(true)
  }

  const writeItemToStorage = async () => {
    if (!data?.length) return

    await storeData("@Latest", { data, updatedAt: Date.now() })

    setEnabled(false)
  }

  useEffect(() => {
    readItemFromStorage()
  }, [])

  useEffect(() => {
    writeItemToStorage()
  }, [response])

  return (
    <View className="pt-6 w-full">
      <Text className="text-xl pb-2 pl-4">Novidades</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.brand} />
      ) : !data ? (
        <View>
          <Text className="text-center">Erro</Text>
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
          <View>
            <Text className="text-sm pb-4">
              {new Date(data.update_at).toLocaleDateString()}
            </Text>
            {/* <Text className="pb-4">Capítulo 120</Text> */}
          </View>
        </View>
      </View>
    </Pressable>
  )
}
