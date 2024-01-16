export default async function baseMangaFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
) {
  const url = `https://mangaverse-api.p.rapidapi.com/manga${path}`

  const response = await fetch(url, {
    method: "GET",
    ...options,
    headers: {
      "X-RapidAPI-Key": process.env.EXPO_PUBLIC_RapidAPIKey!,
      "X-RapidAPI-Host": "mangaverse-api.p.rapidapi.com",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw response
  }

  const result: T = await response.json()
  return result
}
