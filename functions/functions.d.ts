declare namespace NetlifyFunction {
  type Event = {
    queryStringParameters: Record<string, string>;
    httpMethod: string;
    body: string;
    path: string;
    isBase64Encoded: boolean;
  };
}

declare module '*/ssr/main' {
  import { ReactElement } from 'react';
  import { ServerStyleSheets } from '@material-ui/core/styles';
  export function createApp(): {
    app: ReactElement;
    stylesheets: ServerStyleSheets;
  };
}
