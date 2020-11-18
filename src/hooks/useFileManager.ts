import { useCallback, useState } from 'react';
import { getImgFileDimension } from '../util';

export type ProcessedImageFile = { img: HTMLImageElement; raw: File };

function getFileTypeNotMatchTips(file: File) {
  if (!/^image/.test(file.type)) {
    return `${file.name}不是图片文件`;
  }
}

function getTooBigFileTips(file: File) {
  if (file.size > 1000000) {
    return `${file.name}文件过大，应使用小于1MB的文件`;
  }
}

function generateErrorTips(file: File) {
  return [getFileTypeNotMatchTips, getTooBigFileTips]
    .map((fn) => fn(file))
    .filter(Boolean);
}

export default function useFileManager({
  onError,
}: { onError?: (errors: string[]) => any } = {}) {
  const [files, setFiles] = useState<Record<string, ProcessedImageFile>>({});

  const handleUpload = useCallback(
    (fs: FileList) => {
      const errorTips: string[] = [];
      let filesWillAdd: File[] | ProcessedImageFile[] = Array.from(fs).filter(
        (file) => {
          const tips = generateErrorTips(file);
          Array.prototype.push.apply(errorTips, tips);
          if (tips.length) return false;
          return true;
        },
      );
      Promise.all(filesWillAdd.map(getImgFileDimension)).then((dims) => {
        filesWillAdd = dims.map((dim, index) =>
          Object.assign(dim, { raw: filesWillAdd[index] }),
        ) as ProcessedImageFile[];
        setFiles(
          filesWillAdd.reduce(
            (acc: Record<string, ProcessedImageFile>, file) => {
              acc[file.raw.name] = file;
              return acc;
            },
            Object.assign({}, files),
          ),
        );
        if (errorTips.length) {
          onError && onError(errorTips);
        }
      });
    },
    [files, onError],
  );

  const handleDelete = useCallback(
    (name: string) => {
      const newFiles: Record<string, ProcessedImageFile> = Object.assign(
        {},
        files,
      );
      delete newFiles[name];
      setFiles(newFiles);
    },
    [files],
  );

  return {
    handleDelete,
    handleUpload,
    setFiles,
    files,
  };
}
