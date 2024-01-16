export interface MangasResponse {
  code: number
  data?: MangasData[] | null
}
export interface MangasData {
  id: string
  title: string
  sub_title: string
  status: string
  thumb: string
  summary: string
  authors?: string[] | null
  genres?: string[] | null
  nsfw: boolean
  type: string
  create_at: number
  update_at: number
}
