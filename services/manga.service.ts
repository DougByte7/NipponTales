import baseMangaFetch from "../utils/baseMangaFetch"
import { buildSearchParams } from "../utils/buildSearchParams"
import { MangasResponse } from "./manga.interfaces"

export function getMangas(
  page: number,
  genres: string[] = [],
  type = "all",
  nsfw?: boolean
) {
  const search = buildSearchParams({
    page,
    genres: genres.join(","),
    type,
    nsfw,
  })

  return baseMangaFetch<MangasResponse>(`/fetch?${search}`)
}

export function getLatestMangas(
  page: number,
  genres: string[] = [],
  type = "all",
  nsfw = false
) {
  const search = buildSearchParams({
    page,
    genres: genres.join(","),
    type,
    nsfw,
  })

  return baseMangaFetch<MangasResponse>(`/latest?${search}`)
}
