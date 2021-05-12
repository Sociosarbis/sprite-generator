import { Response } from './model/response';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';
import { renderToString } from 'react-dom/server';
import { createApp } from './ssr/main';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __VUE_SSR_CONTEXT__?: {
        styles?: string;
      };
    }
  }
}

async function handler() {
  const isDev = process.env.CONTEXT === 'dev';
  let output;
  if (!isDev) {
    output = createApp();
  } else {
    global.__VUE_SSR_CONTEXT__ = {};
    const { createApp } = eval(
      (await axios.get('http://127.0.0.1:3001/main.js')).data,
    );
    output = createApp();
  }

  const template: string = isDev
    ? (await axios.get('http://127.0.0.1:8888/index.html')).data
    : await fs.readFile(
        join(process.env.LAMBDA_TASK_ROOT || '', '../../build/index.html'),
        {
          encoding: 'utf-8',
        },
      );
  console.log(process.env);
  process.env.NODE_ENV = isDev ? 'development' : 'production';
  const html = renderToString(output.app);
  return new Response(
    200,
    template
      .replace(
        '<!--#css-server-side-->',
        isDev ? global.__VUE_SSR_CONTEXT__?.styles || '' : '',
      )
      .replace('/*!jss-server-side*/', output.stylesheets.toString())
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`),
    {
      'content-type': 'text/html',
    },
  );
}

export { handler };
