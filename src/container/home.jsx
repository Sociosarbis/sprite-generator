import React, { useCallback, useState, useRef } from 'react'
import cls from 'classnames'
import { Container, Grid, makeStyles, Paper, Button, AppBar, List, ListItem, Card } from '@material-ui/core'
import Alert from '../component/alert'
import * as pack from 'bin-pack'
import { getImgFileDimension } from '../util'

const useStyles = makeStyles((theme) => ({
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
            display: 'block',
            visibility: 'hidden'
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
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '20px 10px'
    },
    previewImg: {
        width: '100%',
        display: 'block',
        boxShadow: theme.shadows[1]
    },
    spriteVar: {
        width: '100%',
        marginTop: '10px'
    },
    var: {
        wordBreak: 'break-all'
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
    varFileName: {
        backgroundColor: theme.palette.secondary.dark,
        color: '#fff',
        padding: '0 4px'
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
    return [getFileTypeNotMatchTips, getTooBigFileTips].map(fn => fn(file)).filter(Boolean)
}

export default function Home() {
    const classes = useStyles()
    const [files, setFiles] = useState({})
    const [errors, setErrors] = useState([])
    const [varText, setText] = useState('')
    const [open, setOpen] = useState(false)
    const handleDrop = useCallback((fs) => {
        const errorTips = []
        let filesWillAdd = Array.from(fs).filter((file) => {
            const tips = generateErrorTips(file)
            Array.prototype.push.apply(errorTips, tips)
            if (tips.length) return false
            return true
        })
        Promise.all(filesWillAdd.map(getImgFileDimension))
            .then((dims) => {
                filesWillAdd = dims.map((dim, index) => Object.assign(dim, { raw: filesWillAdd[index] }))
                setFiles(filesWillAdd.reduce((acc, file) => {
                    acc[file.raw.name] = file
                    return acc
                }, Object.assign({}, files)))
                if (errorTips.length) {
                    setErrors(errorTips)
                    setOpen(true)
                }
            })
    }, [files])

    const handleDelete = useCallback((name) => {
     const newFiles = Object.assign({}, files)
     delete newFiles[name]
     setFiles(newFiles)   
    }, [files])

    const [generatedImg, setImg] = useState('')
    const cvs = useRef(null)
    const code = useRef(null)

    const handleGenerate = useCallback(() => {
        const dataToPack = Object.keys(files).map((fileName) => ({
            name: fileName,
            width: files[fileName].img.width + 10,
            height: files[fileName].img.height + 10
        })).sort((a, b) => b.width * b.height -a.width * a.height)
        const result = pack(dataToPack, { inPlace: true })
        const canvas = cvs.current
        canvas.width = result.width
        canvas.height = result.height
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, result.width, result.height)
        const rawData = dataToPack.map((img) => ({
            name: img.name,
            width: img.width - 10,
            height: img.height - 10,
            x: img.x + 5,
            y: img.y + 5
        }))
        rawData.forEach(layout => {
            ctx.drawImage(files[layout.name].img, layout.x, layout.y, layout.width, layout.height)
        })
        setImg(canvas.toDataURL('image/png'))
        setText(rawData.map(img => `<span class="${classes.varListSegment}"><span class="${classes.varFileName}">${img.name.replace(/\.[^.]*$/, '')}</span> <span class="${classes.pos}">${img.x}</span> <span class="${classes.pos}">${img.y}</span></span>`).join(','))
    }, [files, classes])

    const handleCopy = useCallback(() => {
        const selection = window.getSelection()
        selection.selectAllChildren(code.current)
        const result = document.execCommand('copy')
        setErrors([result ? '复制成功' : '复制失败'])
        setOpen(true)
        
    }, [])
    return <Container className={classes.main} maxWidth="lg">
        <Alert onClose={() => setOpen(false)} errors={errors} open={open} />
        <Grid container>
            <Grid item xs={10}>
                <Paper className={classes.toolContainer}>
                    <Grid container className={classes.fillHeight} justify="space-around">
                        <Grid className={classes.fillHeight} item xs={5}>
                            <Grid className={classes.fillHeight} container direction="column">
                                <AppBar position="static" className={classes.toolHeader}>拖拽或上传文件&nbsp;
                                        <Button color="default" variant="contained" size="small">点击上传<input onChange={(e) => handleDrop(e.target.files)} className={classes.hiddenUploader} type="file" accept="image/*" multiple></input></Button>
                                        <Button color="default" variant="contained" size="small" onClick={() => setFiles([])}>清空列表</Button>
                                </AppBar>
                                <Paper className={classes.fillHeight} onDragOver={preventDefault} onDrop={(e) => {
                                    preventDefault(e)
                                    handleDrop(e.dataTransfer.files)
                                }} variant="outlined">
                                    <List>
                                        {Object.keys(files).map((fileName, index) => <ListItem key={index}>
                                            <Grid className={classes.fileListItem} container>
                                                <Grid item xs={8}>{index + 1}：{fileName}</Grid>
                                                <Grid item>
                                                    <Button color="secondary" variant="contained" onClick={() => handleDelete(fileName)}>删除</Button>
                                                </Grid>
                                            </Grid>
                                        </ListItem>)}
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                        <Grid className={classes.fillHeight} item xs={5}>
                            <Grid className={classes.fillHeight} container direction="column">
                                <AppBar position="static" className={classes.toolHeader}>
                                    预览效果&nbsp;
                                        <Button color="default" variant="contained" size="small" onClick={handleGenerate}>生成</Button>
                                </AppBar>
                                <Paper className={cls([classes.fillHeight, classes.imgPreviewPanel])} variant="outlined">
                                    <img alt="preview" className={classes.previewImg} src={generatedImg}/>
                                    <canvas ref={cvs}/>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper className={classes.spriteVar}>
                    <AppBar position="static" className={classes.toolHeader}>图片位置信息</AppBar>
                    <Grid className={classes.commonPadding} container spacing={3}>
                        <Grid item xs={11}>
                            <Card className={classes.var}>
                                <p ref={code} dangerouslySetInnerHTML={{ __html: varText}}/>
                            </Card>
                        </Grid>
                        <Grid item xs={1}>
                            <Button color="primary" variant="outlined" onClick={handleCopy}>复制</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    </Container>
}