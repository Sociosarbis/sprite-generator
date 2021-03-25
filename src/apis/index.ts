import axios from 'axios';
import { CompressResponse } from './types';

const axiosInst = axios.create({
  baseURL: '.netlify/functions',
});

class Api {
  async compress(blob: Blob, onProgress?: (progress: number) => any) {
    const data: CompressResponse = (
      await axiosInst.post('compress', blob, {
        headers: {
          'content-type': 'image/png',
        },
        onUploadProgress: (e) => {
          if (onProgress) {
            onProgress(Math.floor(e.loaded / e.total) * 50);
          }
        },
        onDownloadProgress: (e) => {
          if (onProgress) {
            onProgress(Math.floor(e.loaded / e.total) * 50 + 50);
          }
        },
      })
    ).data;
    return data;
  }
}

export default new Api();
