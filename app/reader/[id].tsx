import { Stack, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable } from "react-native";
import Colors from "../../constants/Colors";
import { useColorScheme } from "nativewind";
import { View } from "../../components/Themed";
import { getMangaImages } from "../../services/manga.service";
import { useQuery } from "@tanstack/react-query";
import type { ImagesData } from "../../services/manga.interfaces";
import { getData, storeData } from "../../utils/storage";
import { IconArrowLeft, IconArrowRight } from "tabler-icons-react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

export default function Reader() {
  const { colorScheme } = useColorScheme();
  const params = useGlobalSearchParams();
  const { data, isLoading } = useGetChapterImages(params);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const viewRef = useRef<ReactNativeZoomableView>();

  useEffect(() => {
    if (!data) return;

    storeData(`@ChapterRead/${data[0].manga}/${params.id}`, 'true');
  }, [data]);

  useEffect(() => {
    if (!data) return;

    Image.getSize(data[page].link, (w, h) => {
      setSize({ w, h });
    });
  }, [data, page]);

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: params.title as string,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        }}
      />

      <ReactNativeZoomableView
        ref={viewRef}
        style={{ width: size.w }}
        maxZoom={30}
        contentHeight={size.h}
        contentWidth={size.w}
        panBoundaryPadding={250}
      >
        <Image
          className="mb-32"
          resizeMode="contain"
          defaultSource={require("../../assets/images/logo.png")}
          style={{ height: size.h, width: size.w }}
          source={{ uri: data?.[page].link }}
        />
      </ReactNativeZoomableView>

      {page + 1 < (data?.length ?? 1) - 1 && (
        <Image source={{ uri: data?.[page + 1].link }} />
      )}

      {page < (data?.length ?? 1) - 1 && (
        <Pressable
          className="absolute bottom-8 left-1/4 h-16 w-16 items-center justify-center rounded-full bg-support-700 shadow"
          onPress={async () => {
            await viewRef.current?.moveTo(250, 250);
            setPage(page + 1);
          }}
        >
          <IconArrowLeft color="white" />
        </Pressable>
      )}
      {page > 0 && (
        <Pressable
          className="absolute bottom-8 right-1/4 h-16 w-16 items-center justify-center rounded-full bg-support-700 shadow"
          onPress={async () => {
            await viewRef.current?.moveTo(250, 250);
            setPage(page - 1);
          }}
        >
          <IconArrowRight color="white" />
        </Pressable>
      )}
    </View>
  );
}

function useGetChapterImages(params: Record<string, string | string[]>) {
  const [enabled, setEnabled] = useState(false);
  const [localData, setLocalData] = useState<ImagesData[]>();
  const {
    data: response,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["mangaImages", params.id],
    queryFn: () => getMangaImages(params.id as string),
    enabled,
  });

  const { data = localData } = response ?? {};

  // Cache response cause the api free tier is only 100 reqs / day
  const readItemFromStorage = async () => {
    const item = await getData<{ updatedAt: number; data: ImagesData[] }>(
      `@MangaImages/${params.id}`,
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

    await storeData(`@MangaImages/${params.id}`, {
      data,
      updatedAt: Date.now(),
    });

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
