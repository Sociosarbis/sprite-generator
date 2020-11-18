import React, { useCallback } from 'react';
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
import { downloadFile } from '../util';
import useFileManager from 'src/hooks/useFileManager';
import useErrorTips from 'src/hooks/useErrorTips';
import useSpriteGenerator, { ImageData } from 'src/hooks/useSpriteGenerator';

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

function round3(num: number) {
  return Math.round(num * 1000) / 1000;
}

const OutputInfos: React.FC<{
  onCopy: (isSuccess: number) => any;
  varData: ImageData[] | null;
  scss: string;
}> = (props) => {
  const classes = useStyles({});
  const { onCopy, varData, scss } = props;
  return (
    <div>
      <InfoCopy title="图片位置信息" onComplete={onCopy}>
        <p
          dangerouslySetInnerHTML={{
            __html: varData
              ? (varData as Required<ImageData>[])
                  .map(
                    (img) =>
                      `<span class="${classes.varListSegment}"><span class="${
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
      <InfoCopy title="SCSS模板" onComplete={onCopy}>
        <pre
          className={classes.codeMirror}
          dangerouslySetInnerHTML={{
            __html: scss,
          }}
        ></pre>
      </InfoCopy>
    </div>
  );
};

export default function Home() {
  const classes = useStyles({});

  const { showErrors, errors, open, setOpen } = useErrorTips();
  const { files, setFiles, handleUpload, handleDelete } = useFileManager({
    onError: showErrors,
  });

  const {
    generatedImg,
    outputFilePath,
    cvs,
    handleGenerate,
    handleInput,
    scss,
    varData,
  } = useSpriteGenerator(files);

  const handleDownload = useCallback(() => {
    if (!generatedImg.src) {
      showErrors(['未生成图片']);
    } else {
      (cvs.current as HTMLCanvasElement).toBlob((blob) => {
        downloadFile(
          blob as Blob,
          outputFilePath ? `${outputFilePath}.png` : 'sprite.png',
        );
      });
    }
  }, [generatedImg.src, outputFilePath, cvs, showErrors]);

  const handleCopy = useCallback(
    (isSuccess) => {
      showErrors([isSuccess ? '复制成功' : '复制失败']);
    },
    [showErrors],
  );

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
                        onChange={(e) =>
                          handleUpload(e.target.files as FileList)
                        }
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
                      handleUpload(e.dataTransfer.files);
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
            <OutputInfos onCopy={handleCopy} scss={scss} varData={varData} />
          ) : null}
        </Grid>
      </Grid>
      <ExtraFeatures />
    </Container>
  );
}
