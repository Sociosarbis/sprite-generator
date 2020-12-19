import { useCallback, useState, useRef, useMemo } from 'react';
import { ProcessedImageFile } from './useFileManager';
import pack from 'bin-pack';

type OutputImage = { src?: string; width?: number; height?: number };

export type ImageData = {
  name: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
};

export default function useSpriteGenerator(
  files: Record<string, ProcessedImageFile>,
  defaultFilePath = 'assets/icon',
) {
  const [generatedImg, setImg] = useState<OutputImage>({});

  const [varData, setData] = useState<ImageData[] | null>(null);

  const [outputFilePath, setOutputFilePath] = useState('');

  const normalizedOutputFilePath = outputFilePath || defaultFilePath;

  const handleInput = useCallback((e) => {
    setOutputFilePath(e.target.value);
  }, []);

  const outputFilename = useMemo(
    () => normalizedOutputFilePath.replace(/^.*?([^/\\]*)$/, '$1'),
    [normalizedOutputFilePath],
  );

  const cvs = useRef<HTMLCanvasElement>(null);

  const handleGenerate = useCallback(() => {
    const fileKeys = Object.keys(files);
    if (fileKeys.length === 0) return;
    const dataToPack: ImageData[] = fileKeys
      .map((fileName: string) => ({
        name: fileName,
        width: files[fileName].img.width + 10,
        height: files[fileName].img.height + 10,
      }))
      .sort((a, b) => b.width * b.height - a.width * a.height);

    const result = pack(dataToPack, { inPlace: true });
    const canvas = cvs.current as HTMLCanvasElement;
    canvas.width = result.width;
    canvas.height = result.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, result.width, result.height);
    const rawData = dataToPack.map((img) => ({
      filename: img.name,
      name: img.name.replace(/\.\S*?$/, ''),
      width: img.width - 10,
      height: img.height - 10,
      x: (img.x as number) + 5,
      y: (img.y as number) + 5,
    }));
    rawData.forEach((layout) => {
      ctx.drawImage(
        files[layout.filename].img,
        layout.x,
        layout.y,
        layout.width,
        layout.height,
      );
    });
    setImg({
      src: canvas.toDataURL('image/png'),
      width: result.width,
      height: result.height,
    });
    setData(rawData);
  }, [files]);

  const scss = useMemo(() => {
    if (!generatedImg.src) return '';
    return (
      `$${outputFilename}-icons: ${(varData as Required<ImageData>[])
        .map(
          (item) =>
            `${item.name} ${item.x} ${item.y} ${item.width} ${item.height},`,
        )
        .join('')};\n` +
      `@each $name, $x, $y, $width, $height in $${outputFilename}-icons {\n` +
      ` .icon-#{$name} {\n` +
      `   $ratio: 1 / $width;\n\n` +
      `   width: 1em;` +
      `   height: $height / $width * 1em;` +
      `   background-position: (-$x * $ratio) + 0em (-$y * $ratio) + 0em;\n` +
      `   background-image:  url(~${normalizedOutputFilePath}.png);\n` +
      `   background-size: ${generatedImg.width} * $ratio + em ${generatedImg.height} * $ratio + em; \n` +
      ` }\n` +
      `}\n`
    );
  }, [generatedImg, outputFilename, normalizedOutputFilePath, varData]);

  return {
    generatedImg,
    outputFilePath,
    cvs,
    scss,
    varData,
    handleGenerate,
    handleInput,
  };
}
