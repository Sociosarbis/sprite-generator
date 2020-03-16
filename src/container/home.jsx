-import React, { useCallback, useState, useRef } from 'react'
import cls from 'classnames'
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Button,
  AppBar,
  List,
  ListItem,
  Switch,
  FormControlLabel,
  TextField
} from '@material-ui/core'
import Alert from '../component/alert'
import InfoCopy from '../component/infoCopy'
import ExtraFeatures from '../component/extraFeatures'
import * as pack from 'bin-pack'
import { getImgFileDimension } from '../util'

const useStyles = makeStyles(theme => ({
  fillHeight: {
    height: '100%',
    flex: 1
  },
  fillWidth: {
    width: '100%'
  },
  commonPadding: {
    padding: '20px 10px'
  },
  noWrap: {
    flexWrap: 'nowrap'
  },
  commonMargin: {
    marginLeft: '10px'
  },
  main: {
    wordBreak: 'break-all'
  },
  fileListItem: {
    padding: '5px',
    boxShadow: theme.shadows[1],
    '& .MuiGrid-item': {
      display: 'flex',
      alignItems: 'center',
      '&:not(:first-child)': {
        marginLeft: '5px'
      }
    }
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.dark,
    padding: '5px 5px',
    '& button': {
      '&+button': {
        marginLeft: '5px'
      }
    }
  },
  toolContainer: {
    height: '560px',
    marginTop: '100px',
    padding: '10px 0',
    '& canvas': {
      display: 'none'
    }
  },
  hiddenUploader: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0
  },
  imgPreviewPanel: {
    width: '100%',
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: '20px 17px'
  },
  previewImg: {
    width: '100%',
    display: 'block',
    boxShadow: theme.shadows[1]
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
    boxShadow: theme.shadows[1]
  },
  pos: {
    backgroundColor: theme.palette.success.dark,
    color: '#fff',
    padding: '0 4px'
  },
  size: {
    backgroundColor: theme.palette.error.dark,
    color: '#fff',
    padding: '0 4px'
  },
  varFileName: {
    backgroundColor: theme.palette.secondary.dark,
    color: '#fff',
    padding: '0 4px'
  },
  codeMirror: {
    backgroundColor: 'black',
    color: '#eee',
    whiteSpace: 'pre-wrap'
  },
  filenameInput: {
    marginBottom: '10px'
  }
}))

function preventDefault(e) {
  e.preventDefault()
}

function getFileTypeNotMatchTips(file) {
  if (!/^image/.test(file.type)) {
    return `${file.name}不是图片文件`
  }
}

function getTooBigFileTips(file) {
  if (file.size > 1000000) {
    return `${file.name}文件过大，应使用小于1MB的文件`
  }
}

function generateErrorTips(file) {
  return [getFileTypeNotMatchTips, getTooBigFileTips]
    .map(fn => fn(file))
    .filter(Boolean)
}

function round3(num) {
  return Math.round(num * 1000) / 1000
}

export default function Home() {
  const classes = useStyles()
  const [files, setFiles] = useState({})
  const [errors, setErrors] = useState([])
  const [varData, setData] = useState('')
  const [open, setOpen] = useState(false)
  const [useRem, toggleRem] = useState(false)
  const [outputFilename, setOutputFilename] = useState('')

  const handleInput = useCallback(e => {
    setOutputFilename(e.target.value)
  }, [])
  const handleDrop = useCallback(
    fs => {
      const errorTips = []
      let filesWillAdd = Array.from(fs).filter(file => {
        const tips = generateErrorTips(file)
        Array.prototype.push.apply(errorTips, tips)
        if (tips.length) return false
        return true
      })
      Promise.all(filesWillAdd.map(getImgFileDimension)).then(dims => {
        filesWillAdd = dims.map((dim, index) =>
          Object.assign(dim, { raw: filesWillAdd[index] })
        )
        setFiles(
          filesWillAdd.reduce((acc, file) => {
            acc[file.raw.name] = file
            return acc
          }, Object.assign({}, files))
        )
        if (errorTips.length) {
          setErrors(errorTips)
          setOpen(true)
        }
      })
    },
    [files]
  )

  const handleDelete = useCallback(
    name => {
      const newFiles = Object.assign({}, files)
      delete newFiles[name]
      setFiles(newFiles)
    },
    [files]
  )

  const [generatedImg, setImg] = useState({})
  const cvs = useRef(null)
  const unit = useRem ? 75 : 1
  const handleGenerate = useCallback(() => {
    const fileKeys = Object.keys(files)
    if (fileKeys.length === 0) return
    const dataToPack = fileKeys
      .map(fileName => ({
        name: fileName,
        width: files[fileName].img.width + 10,
        height: files[fileName].img.height + 10
      }))
      .sort((a, b) => b.width * b.height - a.width * a.height)
    const result = pack(dataToPack, { inPlace: true })
    const canvas = cvs.current
    canvas.width = result.width
    canvas.height = result.height
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, result.width, result.height)
    const rawData = dataToPack.map(img => ({
      filename: img.name,
      name: img.name.replace(/\.\S*?$/, ''),
      width: img.width - 10,
      height: img.height - 10,
      x: img.x + 5,
      y: img.y + 5
    }))
    rawData.forEach(layout => {
      ctx.drawImage(
        files[layout.filename].img,
        layout.x,
        layout.y,
        layout.width,
        layout.height
      )
    })
    setImg({
      src: canvas.toDataURL('image/png'),
      width: result.width / unit,
      height: result.height / unit
    })
    setData(rawData)
  }, [files, classes, unit])

  const handleUnitChange = useCallback(e => {
    toggleRem(e.target.checked)
  }, [])

  const handleCopy = useCallback(isSuccess => {
    setErrors([isSuccess ? '复制成功' : '复制失败'])
    setOpen(true)
  }, [])

  const unitStr = useRem ? 'rem' : 'px'

  const outputScss = generatedImg.src
    ? varData
        .map(
          item =>
            `@mixin icon-${item.name}($width, $height) {\n` +
            ` $ratio-x: $width / ${item.width * unit};\n` +
            ` $ratio-y: $height / ${item.height * unit};\n` +
            ` background-size: ${generatedImg.width} * $ratio-x + ${unitStr} ${generatedImg.height} * $ratio-y + ${unitStr}; \n` +
            ` background-position: ${-item.x} * $ratio-x + ${unitStr} ${-item.y} * $ratio-y + ${unitStr};\n` +
            ` background-image:  url(~${outputFilename || 'assets/icon'}.png);\n` +
            `}`
        )
        .join('\n\n')
    : ''

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
                        onChange={e => handleDrop(e.target.files)}
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
                      onClick={() => setFiles([])}
                    >
                      清空列表
                    </Button>
                  </AppBar>
                  <Paper
                    className={classes.fillHeight}
                    onDragOver={preventDefault}
                    onDrop={e => {
                      preventDefault(e)
                      handleDrop(e.dataTransfer.files)
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
                    <FormControlLabel
                      className={classes.commonMargin}
                      control={
                        <Switch checked={useRem} onChange={handleUnitChange} />
                      }
                      label="使用REM"
                    ></FormControlLabel>
                  </AppBar>
                  <Paper
                    className={cls([
                      classes.fillHeight,
                      classes.imgPreviewPanel
                    ])}
                    variant="outlined"
                  >
                    <Grid
                      container
                      className={classes.filenameInput}
                      justify="flex-end"
                    >
                      <TextField
                        label="输出文件名"
                        onChange={handleInput}
                        id="ouput-filename"
                        value={outputFilename}
                        placeholder="输出文件名"
                      />
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
                              {round3(generatedImg.width / unit)}
                            </span>
                            ,
                            <span className={classes.varFileName}>
                              {round3(generatedImg.height / unit)}
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
                      ? varData
                          .map(
                            img =>
                              `<span class="${
                                classes.varListSegment
                              }"><span class="${
                                classes.varFileName
                              }">${img.name.replace(
                                /\.[^.]*$/,
                                ''
                              )}</span> <span class="${classes.pos}">${round3(
                                -img.x / unit
                              )}</span> <span class="${classes.pos}">${round3(
                                -img.y / unit
                              )}</span> <span class="${classes.size}">${round3(
                                img.width / unit
                              )}</span> <span class="${classes.size}">${round3(
                                img.height / unit
                              )}</span></span>`
                          )
                          .join(',')
                      : ''
                  }}
                />
              </InfoCopy>
              <InfoCopy title="SCSS模板" onComplete={handleCopy}>
                <pre
                  className={classes.codeMirror}
                  dangerouslySetInnerHTML={{
                    __html: outputScss.replace(/\n/g, '<br/>')
                  }}
                ></pre>
              </InfoCopy>
            </div>
          ) : null}
        </Grid>
      </Grid>
      <ExtraFeatures />
    </Container>
  )
}
