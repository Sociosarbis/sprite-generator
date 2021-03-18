import CodeMirror from 'codemirror';
import React, { forwardRef, MutableRefObject, useEffect } from 'react';
import { useRef } from 'react';
import { useMount } from 'src/hooks/lifeCycles';
import { makeStyles } from '@material-ui/core';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/sass/sass';

const useStyles = makeStyles({
  editor: {
    width: '100%',
    '& .CodeMirror': {
      height: 'auto',
    },
  },
});

export type CodeMirror = ReturnType<typeof CodeMirror>;

const CodeEditor = forwardRef<
  CodeMirror,
  {
    value: string;
    mode: string;
    readOnly?: boolean;
  }
>(({ value, mode, readOnly }, ref) => {
  const classes = useStyles({});
  const editor = useRef<HTMLDivElement>(null);
  const cm = useRef<ReturnType<typeof CodeMirror>>();

  useEffect(() => {
    if (cm.current) {
      cm.current.setValue(value);
    }
  }, [cm, value]);

  useMount(() => {
    cm.current = CodeMirror(editor.current as HTMLElement, {
      value,
      lineWrapping: true,
      readOnly,
      theme: 'material-darker',
      mode,
    });
    if (ref) {
      (ref as MutableRefObject<CodeMirror>).current = cm.current;
    }
  });
  return <div className={classes.editor} ref={editor} />;
});

export default CodeEditor;
