import axios from './helpers/axios';
import { Response } from './model/response';

async function handler(event: NetlifyFunction.Event) {
  const data = (
    await axios.post(
      'https://tinypng.com/web/shrink',
      Buffer.from(event.body, 'base64'),
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'content-type': 'image/png',
          Connection: 'keep-alive',
          Host: 'tinypng.com',
          DNT: 1,
          Referer: 'https://tinypng.com/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:42.0) Gecko/20100101 Firefox/42.0',
        },
        validateStatus: null,
      },
    )
  ).data;
  const buffer: Buffer = (
    await axios.get(data.output.url, {
      responseType: 'arraybuffer',
    })
  ).data;
  data.output.url = `data:image/png;base64,${buffer.toString('base64')}`;
  return new Response(200, data);
}

export { handler };
