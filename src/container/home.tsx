import React, { useCallback } from 'react';
import cls from 'classnames';
import {
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
import CodeEditor from 'src/component/CodeEditor';
import ExtraFeatures from '../component/extraFeatures';
import { downloadFile, urlToBlob } from '../util';
import useFileManager from 'src/hooks/useFileManager';
import useErrorTips from 'src/hooks/useErrorTips';
import useSpriteGenerator, { ImageData } from 'src/hooks/useSpriteGenerator';
import api from 'src/apis';

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
    minWidth: '950px',
  },
  fileListItem: {
    padding: '5px',
    fontSize: '16px',
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
    display: 'inline-block',
    boxShadow: theme.shadows[1],
  },
  filenameInput: {
    marginBottom: '10px',
  },
  overflowAuto: {
    overflow: 'auto',
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
  const { onCopy, varData, scss } = props;
  return (
    <div>
      <InfoCopy
        title="图片位置信息"
        onComplete={onCopy}
        child={(ref) => (
          <CodeEditor
            ref={ref}
            readOnly={true}
            value={
              varData
                ? (varData as Required<ImageData>[])
                    .map(
                      (img) =>
                        `${img.name.replace(/\.[^.]*$/, '')} ${round3(
                          -img.x,
                        )} ${round3(-img.y)} ${round3(img.width)} ${round3(
                          img.height,
                        )}`,
                    )
                    .join(',') + ';'
                : ''
            }
            mode="sass"
          />
        )}
      ></InfoCopy>
      <InfoCopy
        title="SCSS模板"
        onComplete={onCopy}
        child={(ref) => <CodeEditor ref={ref} value={scss} mode="sass" />}
      ></InfoCopy>
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
    setImg,
    cvs,
    handleGenerate,
    handleInput,
    scss,
    varData,
  } = useSpriteGenerator(files);

  const handleDownload = useCallback(async () => {
    if (!generatedImg.src) {
      showErrors(['未生成图片']);
    } else {
      const blob = await urlToBlob(generatedImg.src);
      downloadFile(
        blob,
        outputFilePath ? `${outputFilePath}.png` : 'sprite.png',
      );
    }
  }, [generatedImg.src, outputFilePath, showErrors]);

  const compress = useCallback(async () => {
    if (generatedImg.src) {
      const blob = await urlToBlob(generatedImg.src);
      const res = await api.compress(blob);
      setImg(
        Object.assign({}, generatedImg, {
          compressed: true,
          src: res.output.url,
        }),
      );
    }
  }, [generatedImg, setImg]);

  const handleCopy = useCallback(
    (isSuccess) => {
      showErrors([isSuccess ? '复制成功' : '复制失败']);
    },
    [showErrors],
  );

  return (
    <div className={cls(classes.main, 'flex')}>
      <ExtraFeatures />
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
                    classes={{
                      root: cls(classes.fillHeight, classes.overflowAuto),
                    }}
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
                              <CodeEditor
                                value={`# ${index + 1}：${fileName}`}
                                mode="markdown"
                                readOnly={true}
                              />
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
                      direction="column"
                      className={classes.filenameInput}
                    >
                      <TextField
                        label="输出文件名"
                        onChange={handleInput}
                        id="ouput-filename"
                        value={outputFilePath}
                        placeholder="输出文件名"
                      />
                      {generatedImg.src ? (
                        <div className={classes.commonPadding}>
                          <Button
                            color="default"
                            variant="contained"
                            size="small"
                            onClick={handleDownload}
                          >
                            下载图片
                          </Button>
                          <Button
                            color="default"
                            disabled={generatedImg.compressed}
                            classes={{ root: classes.commonMargin }}
                            variant="contained"
                            size="small"
                            onClick={compress}
                          >
                            压缩
                          </Button>
                        </div>
                      ) : null}
                    </Grid>
                    <img
                      alt=""
                      className={classes.previewImg}
                      src={generatedImg.src}
                    />
                    {generatedImg.src ? (
                      <InfoCopy
                        title="图片大小"
                        onComplete={handleCopy}
                        child={(ref) => (
                          <CodeEditor
                            ref={ref}
                            mode="markdown"
                            readOnly={true}
                            value={`# ${round3(
                              generatedImg.width as number,
                            )}, ${round3(generatedImg.height as number)}`}
                          />
                        )}
                      ></InfoCopy>
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
    </div>
  );
}
