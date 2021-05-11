import React, { useRef, useCallback, RefObject } from 'react';
import cls from 'classnames';
import {
  Grid,
  makeStyles,
  Paper,
  Button,
  AppBar,
  Card,
} from '@material-ui/core';
import { Editor } from 'codemirror';

const useStyles = makeStyles((theme) => ({
  commonPadding: {
    padding: '20px 10px',
  },
  noWrap: {
    flexWrap: 'nowrap',
  },
  spriteVar: {
    width: '100%',
    marginTop: '10px',
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
  var: {
    wordBreak: 'break-all',
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
}));

const InfoCopy: React.FC<{
  onComplete?: (result: number) => any;
  title: string;
  child: (ref: RefObject<Editor>) => React.ReactNode;
}> = (props) => {
  const editorRef = useRef<Editor>(null);
  const { onComplete, child, title } = props;
  const handleCopy = useCallback(() => {
    if (editorRef.current) {
      document.addEventListener(
        'copy',
        (e) => {
          e.preventDefault();
          e.clipboardData?.setData(
            'text/plain',
            editorRef.current?.getValue() || '',
          );
        },
        { once: true },
      );
      const result = document.execCommand('copy');
      onComplete && onComplete(result ? 1 : 0);
    }
  }, [onComplete]);
  const classes = useStyles({});
  return (
    <Paper className={classes.spriteVar}>
      <AppBar position="static" className={classes.toolHeader}>
        {title}
      </AppBar>
      <Grid
        className={cls(classes.commonPadding, classes.noWrap)}
        container
        spacing={3}
      >
        <Grid item xs={11}>
          <Card className={classes.var}>{child(editorRef)}</Card>
        </Grid>
        <Grid item>
          <Button color="primary" variant="outlined" onClick={handleCopy}>
            复制
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default InfoCopy;
