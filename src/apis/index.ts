import axios from 'axios';
import { CompressResponse } from './types';

const axiosInst = axios.create({
  baseURL: '.netlify/functions',
});

class Api {
  async compress(blob: Blob, onProgress?: (progress: number) => any) {
    const data: CompressResponse = (
      await axiosInst.post(
        'compress',
        btoa(
          new Uint8Array(await blob.arrayBuffer()).reduce(
            (acc, d) => acc + String.fromCharCode(d),
            '',
          ),
        ),
        {
          headers: {
            'content-type': 'text/plain',
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
        },
      )
    ).data;
    return data;
  }
}

export default new Api();
