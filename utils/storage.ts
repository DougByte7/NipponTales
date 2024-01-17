import AsyncStorage from "@react-native-async-storage/async-storage"

export async function storeData(key: string, value: any) {
  try {
    const jsonValue =
      typeof value === "object" || Array.isArray(value)
        ? JSON.stringify(value)
        : value
    await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    console.error(e)
  }
}

export async function getData<T>(key: string, shouldParse = true) {
  try {
    const value = await AsyncStorage.getItem(key)

    return (
      value != null && shouldParse ? JSON.parse(value) : value
    ) as T | null
  } catch (e) {
    console.error(e)
  }
}
