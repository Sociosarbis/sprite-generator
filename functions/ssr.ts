import { Response } from './model/response';
import axios from 'axios';
import { renderToString } from 'react-dom/server';
import { createApp } from './ssr/main';

async function handler() {
  const output = createApp();
  const template: string = (
    await axios.get(
      `${
        process.env.CONTEXT === 'dev'
          ? 'http://127.0.0.1:8888'
          : 'https://sprite-generator.netlify.app'
      }/index.html`,
    )
  ).data;
  const html = renderToString(output.app);
  return new Response(
    200,
    template
      .replace('/*!jss-server-side*/', output.stylesheets.toString())
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`),
    {
      'content-type': 'text/html',
    },
  );
}

export { handler };
