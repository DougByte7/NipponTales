export function buildSearchParams(
  params: Record<string, string | number | boolean | Nill>
) {
  Object.keys(params).forEach(
    (key) =>
      (params[key] === undefined || params[key] === null) && delete params[key]
  )

  return new URLSearchParams(params as Record<string, string>)
}
