const studioEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>
}).env

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  studioEnv?.SANITY_STUDIO_API_VERSION ||
  process.env.SANITY_STUDIO_API_VERSION ||
  '2026-11-24'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
    studioEnv?.SANITY_STUDIO_DATASET ||
    process.env.SANITY_STUDIO_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    studioEnv?.SANITY_STUDIO_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
