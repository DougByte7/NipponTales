import { Stack, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable } from "react-native";
import Colors from "../../constants/Colors";
import { useColorScheme } from "nativewind";
import { View } from "../../components/Themed";
import { getMangaImages } from "../../services/manga.service";
import type { ImagesResponse } from "../../services/manga.interfaces";
import { storeData } from "../../utils/storage";
import {
  IconArrowLeft,
  IconArrowRight,
  IconZoomReset,
} from "tabler-icons-react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import useStorageQuery from "../../hooks/useStorageQuery";

export default function Reader() {
  const { colorScheme } = useColorScheme();
  const params = useGlobalSearchParams();
  const { data } = useStorageQuery<ImagesResponse>({
    storageKey: `@MangaImages/${params.id}`,
    queryKey: ["mangaImages", params.id],
    queryFn: () => getMangaImages(params.id as string),
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const viewRef = useRef<ReactNativeZoomableView>();

  useEffect(() => {
    if (!data) return;

    storeData(`@ChapterRead/${data[0].manga}/${params.id}`, "true");
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
          headerTransparent: true,
          headerBackVisible: false,
        }}
      />

      <ReactNativeZoomableView
        ref={viewRef as any}
        style={{ width: size.w }}
        minZoom={0.1}
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
          className="absolute bottom-8 left-1/2 h-16 w-16 -translate-x-28 items-center justify-center rounded-full bg-support-100 shadow dark:bg-support-700"
          onPress={async () => {
            await viewRef.current?.moveTo(250, 250);
            setPage(page + 1);
          }}
        >
          <IconArrowLeft color={colorScheme === "dark" ? "white" : "black"} />
        </Pressable>
      )}
      <Pressable
        className="absolute bottom-8 left-1/2 h-16 w-16 -translate-x-8 items-center justify-center rounded-full bg-support-100 shadow dark:bg-support-700"
        onPress={() => {
          viewRef.current?.zoomTo(1);
        }}
      >
        <IconZoomReset color={colorScheme === "dark" ? "white" : "black"} />
      </Pressable>
      {page > 0 && (
        <Pressable
          className="absolute bottom-8 right-1/2 h-16 w-16 translate-x-28 items-center justify-center rounded-full bg-support-100 shadow dark:bg-support-700"
          onPress={async () => {
            await viewRef.current?.moveTo(250, 250);
            setPage(page - 1);
          }}
        >
          <IconArrowRight color={colorScheme === "dark" ? "white" : "black"} />
        </Pressable>
      )}
    </View>
  );
}
