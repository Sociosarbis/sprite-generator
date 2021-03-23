export type CompressResponse = {
  input: { size: number; type: string };
  output: {
    height: number;
    ratio: number;
    size: number;
    type: string;
    url: string;
    width: number;
  };
};
