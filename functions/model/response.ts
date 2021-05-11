class Response {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  constructor(statusCode: number, data: any, headers?: Record<string, string>) {
    this.statusCode = statusCode;
    this.body =
      typeof data === 'string'
        ? data
        : Buffer.from(JSON.stringify(data)).toString('utf-8');
    this.headers = Object.assign(
      {
        'content-type': 'application/json;charset=UTF-8',
      },
      headers,
    );
  }
}

export { Response };
