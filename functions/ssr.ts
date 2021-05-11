import { Response } from './model/response';
import axios from 'axios';
import { renderToString } from 'react-dom/server';
import { createApp } from './ssr/app';

async function handler() {
  const output = createApp();
  const template: string = (await axios.get('http://127.0.0.1:8888/index.html'))
    .data;
  return new Response(
    200,
    template
      .replace('/*!jss-server-side*/', output.css)
      .replace(
        '<div id="root"></div>',
        `<div id="root">${renderToString(output.app)}</div>`,
      ),
    {
      'content-type': 'text/html',
    },
  );
}

export { handler };
