import { useColorScheme } from "nativewind";
import { View } from "./Themed";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { IconSearch } from "tabler-icons-react-native";
import Colors from "../constants/Colors";

interface SearchBarProps {
  value?: string;
}
export default function SearchBar({ value }: SearchBarProps) {
  const { colorScheme: theme } = useColorScheme() ?? "light";
  const [search, setSearch] = useState(value ?? "");
  const router = useRouter();
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
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => router.push(`/search/${search}`)}
        />
      </View>
    </View>
  );
}
