declare namespace NetlifyFunction {
  type Event = {
    queryStringParameters: Record<string, string>;
    httpMethod: string;
    body: string;
    path: string;
    isBase64Encoded: boolean;
  };
}

declare module '*/ssr/app' {
  import { ReactElement } from 'react';
  export function createApp(): { app: ReactElement; css: string };
}
