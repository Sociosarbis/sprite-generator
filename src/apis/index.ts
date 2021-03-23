import axios from 'axios';
import { CompressResponse } from './types';

const axiosInst = axios.create({
  baseURL: '.netlify/functions',
});

class Api {
  async compress(blob: Blob) {
    const data: CompressResponse = (
      await axiosInst.post('compress', blob, {
        headers: {
          'content-type': 'image/png',
        },
      })
    ).data;
    return data;
  }
}

export default new Api();
