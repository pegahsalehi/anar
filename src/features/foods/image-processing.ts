import { allowedFoodImageTypes, maxFoodImageSizeBytes } from "@/lib/storage/food-images";

export const maxFoodImageDimension = 1600;

const qualitySteps = [0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38, 0.3];
const scaleSteps = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

type PreparedFoodImageResult =
  | { ok: true; file: File; wasCompressed: boolean }
  | { ok: false; error: string };

type Dimensions = {
  width: number;
  height: number;
};

export async function prepareFoodImageForUpload(file: File): Promise<PreparedFoodImageResult> {
  if (!allowedFoodImageTypes.includes(file.type as (typeof allowedFoodImageTypes)[number])) {
    return { ok: false, error: "Use a JPEG, PNG, or WebP image." };
  }

  if (file.size === 0) {
    return { ok: true, file, wasCompressed: false };
  }

  const image = await loadImage(file);
  const baseDimensions = getScaledImageDimensions(
    image.naturalWidth,
    image.naturalHeight,
    maxFoodImageDimension,
  );

  if (
    file.size <= maxFoodImageSizeBytes &&
    image.naturalWidth <= maxFoodImageDimension &&
    image.naturalHeight <= maxFoodImageDimension
  ) {
    return { ok: true, file, wasCompressed: false };
  }

  const outputType = (await canEncodeWebP()) ? "image/webp" : "image/jpeg";
  const extension = outputType === "image/webp" ? "webp" : "jpg";

  for (const scale of scaleSteps) {
    const dimensions = {
      width: Math.max(1, Math.round(baseDimensions.width * scale)),
      height: Math.max(1, Math.round(baseDimensions.height * scale)),
    };
    const canvas = drawImageToCanvas(image, dimensions, outputType);

    for (const quality of qualitySteps) {
      const blob = await canvasToBlob(canvas, outputType, quality);

      if (!blob) {
        continue;
      }

      const compressedFile = new File([blob], buildCompressedFoodImageName(file.name, extension), {
        type: blob.type || outputType,
        lastModified: Date.now(),
      });

      if (compressedFile.size <= maxFoodImageSizeBytes) {
        return { ok: true, file: compressedFile, wasCompressed: true };
      }
    }
  }

  return {
    ok: false,
    error:
      "Image could not be compressed below 1 MB. Please choose a smaller image.",
  };
}

export function getScaledImageDimensions(width: number, height: number, maxDimension: number) {
  if (width <= 0 || height <= 0) {
    return { width: 1, height: 1 };
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export function formatFoodImageFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildCompressedFoodImageName(name: string, extension: string) {
  const basename = name.replace(/\.[^.]+$/, "").trim() || "food-image";
  return `${basename}.${extension}`;
}

function drawImageToCanvas(
  image: HTMLImageElement,
  dimensions: Dimensions,
  outputType: string,
) {
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image compression is not available in this browser.");
  }

  if (outputType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

  return canvas;
}

function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded. Please choose another image."));
    };
    image.src = objectUrl;
  });
}

async function canEncodeWebP() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const blob = await canvasToBlob(canvas, "image/webp", 0.8);
  return blob?.type === "image/webp";
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}
