import React, { useCallback, useState, useRef, useMemo } from 'react';
import cls from 'classnames';
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Button,
  AppBar,
  List,
  ListItem,
  TextField,
} from '@material-ui/core';
import Alert from '../component/alert';
import InfoCopy from '../component/infoCopy';
import ExtraFeatures from '../component/extraFeatures';
import pack from 'bin-pack';
import { getImgFileDimension, downloadFile } from '../util';

type ImageData = {
  name: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
};

type OutputImage = { src?: string; width?: number; height?: number };

type ProcessedImageFile = { img: HTMLImageElement; raw: File };

const useStyles = makeStyles((theme) => ({
  fillHeight: {
    height: '100%',
    flex: 1,
  },
  fillWidth: {
    width: '100%',
  },
  commonPadding: {
    padding: '20px 10px',
  },
  noWrap: {
    flexWrap: 'nowrap',
  },
  commonMargin: {
    marginLeft: '10px',
  },
  main: {
    wordBreak: 'break-all',
    minWidth: '930px',
  },
  fileListItem: {
    padding: '5px',
    boxShadow: theme.shadows[1],
    '& .MuiGrid-item': {
      display: 'flex',
      alignItems: 'center',
      '&:not(:first-child)': {
        marginLeft: '5px',
      },
    },
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.dark,
    padding: '5px 5px',
    '& button': {
      '&+button': {
        marginLeft: '5px',
      },
    },
  },
  toolContainer: {
    height: '560px',
    marginTop: '100px',
    padding: '10px 0',
    '& canvas': {
      display: 'none',
    },
  },
  hiddenUploader: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0,
  },
  imgPreviewPanel: {
    width: '100%',
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: '20px 17px',
  },
  previewImg: {
    width: '100%',
    display: 'block',
    boxShadow: theme.shadows[1],
  },
  varListSegment: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    marginLeft: '5px',
    wordBreak: 'keep-all',
    whiteSpace: 'nowrap',
    lineHeight: 1.5,
    borderRadius: '1em',
    border: '1px solid transparent',
    overflow: 'hidden',
    display: 'inline-block',
    boxShadow: theme.shadows[1],
  },
  pos: {
    backgroundColor: theme.palette.success.dark,
    color: '#fff',
    padding: '0 4px',
  },
  size: {
    backgroundColor: theme.palette.error.dark,
    color: '#fff',
    padding: '0 4px',
  },
  varFileName: {
    backgroundColor: theme.palette.secondary.dark,
    color: '#fff',
    padding: '0 4px',
  },
  codeMirror: {
    backgroundColor: 'black',
    color: '#eee',
    whiteSpace: 'pre-wrap',
  },
  filenameInput: {
    marginBottom: '10px',
  },
}));

function preventDefault(e: React.SyntheticEvent) {
  e.preventDefault();
}

function getFileTypeNotMatchTips(file: File) {
  if (!/^image/.test(file.type)) {
    return `${file.name}不是图片文件`;
  }
}

function getTooBigFileTips(file: File) {
  if (file.size > 1000000) {
    return `${file.name}文件过大，应使用小于1MB的文件`;
  }
}

function generateErrorTips(file: File) {
  return [getFileTypeNotMatchTips, getTooBigFileTips]
    .map((fn) => fn(file))
    .filter(Boolean);
}

function round3(num: number) {
  return Math.round(num * 1000) / 1000;
}

export default function Home() {
  const classes = useStyles({});
  const [files, setFiles] = useState<Record<string, ProcessedImageFile>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [varData, setData] = useState<ImageData[] | null>(null);
  const [open, setOpen] = useState(false);
  const [outputFilePath, setOutputFilePath] = useState('');

  const normalizedOutputFilePath = outputFilePath || 'assets/icon';

  const handleInput = useCallback((e) => {
    setOutputFilePath(e.target.value);
  }, []);
  const handleDrop = useCallback(
    (fs: FileList) => {
      const errorTips: string[] = [];
      let filesWillAdd: File[] | ProcessedImageFile[] = Array.from(fs).filter(
        (file) => {
          const tips = generateErrorTips(file);
          Array.prototype.push.apply(errorTips, tips);
          if (tips.length) return false;
          return true;
        },
      );
      Promise.all(filesWillAdd.map(getImgFileDimension)).then((dims) => {
        filesWillAdd = dims.map((dim, index) =>
          Object.assign(dim, { raw: filesWillAdd[index] }),
        ) as ProcessedImageFile[];
        setFiles(
          filesWillAdd.reduce(
            (acc: Record<string, ProcessedImageFile>, file) => {
              acc[file.raw.name] = file;
              return acc;
            },
            Object.assign({}, files),
          ),
        );
        if (errorTips.length) {
          setErrors(errorTips);
          setOpen(true);
        }
      });
    },
    [files],
  );

  const handleDelete = useCallback(
    (name: string) => {
      const newFiles: Record<string, ProcessedImageFile> = Object.assign(
        {},
        files,
      );
      delete newFiles[name];
      setFiles(newFiles);
    },
    [files],
  );

  const [generatedImg, setImg] = useState<OutputImage>({});
  const cvs = useRef<HTMLCanvasElement>(null);
  const handleGenerate = useCallback(() => {
    const fileKeys = Object.keys(files);
    if (fileKeys.length === 0) return;
    const dataToPack: ImageData[] = fileKeys
      .map((fileName: string) => ({
        name: fileName,
        width: files[fileName].img.width + 10,
        height: files[fileName].img.height + 10,
      }))
      .sort((a, b) => b.width * b.height - a.width * a.height);

    const result = pack(dataToPack, { inPlace: true });
    const canvas = cvs.current as HTMLCanvasElement;
    canvas.width = result.width;
    canvas.height = result.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, result.width, result.height);
    const rawData = dataToPack.map((img) => ({
      filename: img.name,
      name: img.name.replace(/\.\S*?$/, ''),
      width: img.width - 10,
      height: img.height - 10,
      x: (img.x as number) + 5,
      y: (img.y as number) + 5,
    }));
    rawData.forEach((layout) => {
      ctx.drawImage(
        files[layout.filename].img,
        layout.x,
        layout.y,
        layout.width,
        layout.height,
      );
    });
    setImg({
      src: canvas.toDataURL('image/png'),
      width: result.width,
      height: result.height,
    });
    setData(rawData);
  }, [files]);

  const outputFilename = useMemo(
    () => normalizedOutputFilePath.replace(/^.*?([^/\\]*)$/, '$1'),
    [normalizedOutputFilePath],
  );

  const handleDownload = useCallback(() => {
    if (!generatedImg.src) {
      setErrors(['未生成图片']);
      setOpen(true);
    } else {
      (cvs.current as HTMLCanvasElement).toBlob((blob) => {
        downloadFile(
          blob as Blob,
          outputFilePath ? `${outputFilePath}.png` : 'sprite.png',
        );
      });
    }
  }, [generatedImg.src, outputFilePath]);

  const handleCopy = useCallback((isSuccess) => {
    setErrors([isSuccess ? '复制成功' : '复制失败']);
    setOpen(true);
  }, []);

  return (
    <Container className={classes.main} maxWidth="lg">
      <Alert onClose={() => setOpen(false)} errors={errors} open={open} />
      <Grid container>
        <Grid item xs={10}>
          <Paper className={classes.toolContainer}>
            <Grid
              container
              className={classes.fillHeight}
              justify="space-around"
            >
              <Grid className={classes.fillHeight} item xs={5}>
                <Grid
                  className={classes.fillHeight}
                  container
                  direction="column"
                >
                  <AppBar position="static" className={classes.toolHeader}>
                    拖拽或上传文件&nbsp;
                    <Button color="default" variant="contained" size="small">
                      点击上传
                      <input
                        onChange={(e) => handleDrop(e.target.files as FileList)}
                        className={classes.hiddenUploader}
                        type="file"
                        accept="image/*"
                        multiple
                      ></input>
                    </Button>
                    <Button
                      color="default"
                      variant="contained"
                      size="small"
                      onClick={() => setFiles({})}
                    >
                      清空列表
                    </Button>
                  </AppBar>
                  <Paper
                    className={classes.fillHeight}
                    onDragOver={preventDefault}
                    onDrop={(e) => {
                      preventDefault(e);
                      handleDrop(e.dataTransfer.files);
                    }}
                    variant="outlined"
                  >
                    <List>
                      {Object.keys(files).map((fileName, index) => (
                        <ListItem key={index}>
                          <Grid className={classes.fileListItem} container>
                            <Grid item xs={8}>
                              {index + 1}：{fileName}
                            </Grid>
                            <Grid item>
                              <Button
                                color="secondary"
                                variant="contained"
                                onClick={() => handleDelete(fileName)}
                              >
                                删除
                              </Button>
                            </Grid>
                          </Grid>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
              <Grid className={classes.fillHeight} item xs={5}>
                <Grid
                  className={classes.fillHeight}
                  container
                  direction="column"
                >
                  <AppBar position="static" className={classes.toolHeader}>
                    预览效果&nbsp;
                    <Button
                      color="default"
                      variant="contained"
                      size="small"
                      onClick={handleGenerate}
                    >
                      生成
                    </Button>
                  </AppBar>
                  <Paper
                    className={cls([
                      classes.fillHeight,
                      classes.imgPreviewPanel,
                    ])}
                    variant="outlined"
                  >
                    <Grid
                      container
                      className={classes.filenameInput}
                      justify="flex-end"
                      alignItems="flex-end"
                    >
                      <TextField
                        label="输出文件名"
                        onChange={handleInput}
                        id="ouput-filename"
                        value={outputFilePath}
                        placeholder="输出文件名"
                      />
                      <Button
                        color="default"
                        variant="contained"
                        size="small"
                        onClick={handleDownload}
                      >
                        下载图片
                      </Button>
                    </Grid>
                    <img
                      alt="preview"
                      className={classes.previewImg}
                      src={generatedImg.src}
                    />
                    {generatedImg.src ? (
                      <InfoCopy title="图片大小" onComplete={handleCopy}>
                        <p>
                          <span className={classes.varListSegment}>
                            <span className={classes.varFileName}>
                              {round3(generatedImg.width as number)}
                            </span>
                            ,
                            <span className={classes.varFileName}>
                              {round3(generatedImg.height as number)}
                            </span>
                          </span>
                        </p>
                      </InfoCopy>
                    ) : null}
                    <canvas ref={cvs} />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          {generatedImg.src ? (
            <div>
              <InfoCopy title="图片位置信息" onComplete={handleCopy}>
                <p
                  dangerouslySetInnerHTML={{
                    __html: varData
                      ? (varData as Required<ImageData>[])
                          .map(
                            (img) =>
                              `<span class="${
                                classes.varListSegment
                              }"><span class="${
                                classes.varFileName
                              }">${img.name.replace(
                                /\.[^.]*$/,
                                '',
                              )}</span> <span class="${classes.pos}">${round3(
                                -img.x,
                              )}</span> <span class="${classes.pos}">${round3(
                                -img.y,
                              )}</span> <span class="${classes.size}">${round3(
                                img.width,
                              )}</span> <span class="${classes.size}">${round3(
                                img.height,
                              )}</span></span>`,
                          )
                          .join(',')
                      : '',
                  }}
                />
              </InfoCopy>
              <InfoCopy title="SCSS模板" onComplete={handleCopy}>
                <pre
                  className={classes.codeMirror}
                  dangerouslySetInnerHTML={{
                    __html: (
                      `$${outputFilename}-icons: ${(varData as Required<
                        ImageData
                      >[])
                        .map(
                          (item) =>
                            `${item.name} ${item.x} ${item.y} ${item.width} ${item.height},`,
                        )
                        .join('')};\n` +
                      `@each $name, $x, $y, $width, $height in $${outputFilename}-icons {\n` +
                      ` .icon-#{$name} {\n` +
                      `   $ratio: 1 / $width;\n\n` +
                      `   height: $height / $width * 1em;` +
                      `   background-position: (-$x * $ratio) + 0em (-$y * $ratio) + 0em;\n` +
                      `   background-image:  url(~${normalizedOutputFilePath}.png);\n` +
                      `   background-size: ${generatedImg.width} * $ratio + em ${generatedImg.height} * $ratio + em; \n` +
                      ` }\n` +
                      `}\n`
                    ).replace(/\n/g, '<br/>'),
                  }}
                ></pre>
              </InfoCopy>
            </div>
          ) : null}
        </Grid>
      </Grid>
      <ExtraFeatures />
    </Container>
  );
}
