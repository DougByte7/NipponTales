export interface MangasResponse {
  code: number;
  data?: MangasData[] | null;
}
export interface MangaResponse {
  code: number;
  data?: MangasData | null;
}
export interface MangasData {
  id: string;
  title: string;
  sub_title: string;
  status: string;
  thumb: string;
  summary: string;
  authors?: string[] | null;
  genres?: string[] | null;
  nsfw: boolean;
  type: string;
  total_chapter: number;
  create_at: number;
  update_at: number;
}

export interface ChaptersResponse {
  code: number;
  data?: ChaptersData[] | null;
}
export interface ChaptersData {
  id: string;
  manga: string;
  title: string;
  create_at: number;
  update_at: number;
}

export interface ImagesResponse {
  code: number;
  data?: ImagesData[] | null;
}
export interface ImagesData {
  id: string;
  chapter: string;
  manga: string;
  index: number;
  link: string;
}
