import baseMangaFetch from "../utils/baseMangaFetch";
import { buildSearchParams } from "../utils/buildSearchParams";
import type {
  ChaptersResponse,
  ImagesResponse,
  MangaResponse,
  MangasResponse,
} from "./manga.interfaces";

export function getSearchMangas(text: string, type = "all", nsfw?: boolean) {
  const search = buildSearchParams({
    text,
    type,
    nsfw,
  });

  return baseMangaFetch<MangasResponse>(`/search?${search}`);
}

export function getMangas(
  page: number,
  genres: string[] = [],
  type = "all",
  nsfw: boolean = false,
) {
  const search = buildSearchParams({
    page,
    genres: genres.join(","),
    type,
    nsfw,
  });

  return baseMangaFetch<MangasResponse>(`/fetch?${search}`);
}

export function getManga(id: string) {
  const search = buildSearchParams({
    id,
  });

  return baseMangaFetch<MangaResponse>(`?${search}`);
}

export function getLatestMangas(
  page: number,
  genres: string[] = [],
  type = "all",
  nsfw = false,
) {
  const search = buildSearchParams({
    page,
    genres: genres.join(","),
    type,
    nsfw,
  });

  return baseMangaFetch<MangasResponse>(`/latest?${search}`);
}

export function getMangaChapters(mangaId: string) {
  const search = buildSearchParams({
    id: mangaId,
  });

  return baseMangaFetch<ChaptersResponse>(`/chapter?${search}`);
}

export function getMangaImages(chapterId: string) {
  const search = buildSearchParams({
    id: chapterId,
  });

  return baseMangaFetch<ImagesResponse>(`/image?${search}`);
}
