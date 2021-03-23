import axios from 'axios';

async function urlToBlob(url: string): Promise<Blob> {
  return (await axios.get(url, { responseType: 'blob' })).data;
}

function getImgDimension(src: string): Promise<{ img: HTMLImageElement }> {
  return new Promise((res) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      res({
        img,
      });
    };
  });
}

function getImgFileDimension(file: File) {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(file);
  return new Promise<string>((res) => {
    fileReader.onloadend = () => {
      res(fileReader.result as string);
    };
  }).then(getImgDimension);
}

function downloadFile(blob: Blob, path: string) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.setAttribute('href', url);
  const filename = path.replace(/^.*?([^/]+)$/, '$1');
  a.setAttribute('download', filename);
  a.click();
  URL.revokeObjectURL(url);
}

export { getImgFileDimension, downloadFile, urlToBlob };
