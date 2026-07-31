import type { Area } from "react-easy-crop"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export async function getCroppedImageBlob(
  imageSrc: string,
  cropPixels: Area,
  mimeType = "image/jpeg",
): Promise<Blob> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement("canvas")
  canvas.width = cropPixels.width
  canvas.height = cropPixels.height

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Kon canvas context niet aanmaken")

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Bijsnijden mislukt"))
      },
      mimeType,
      0.92,
    )
  })
}
