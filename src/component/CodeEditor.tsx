import { Editor } from 'codemirror';
import React, { forwardRef, MutableRefObject, useEffect } from 'react';
import { useRef } from 'react';
import { useMount } from 'src/hooks/lifeCycles';
import { makeStyles } from '@material-ui/core';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';

const useStyles = makeStyles({
  editor: {
    width: '100%',
    '& .CodeMirror': {
      height: 'auto',
    },
  },
});

const CodeEditor = forwardRef<
  Editor,
  {
    value: string;
    mode: string;
    readOnly?: boolean;
  }
>(({ value, mode, readOnly }, ref) => {
  const classes = useStyles({});
  const editor = useRef<HTMLDivElement>(null);
  const cm = useRef<Editor>();

  useEffect(() => {
    if (cm.current) {
      cm.current.setValue(value);
    }
  }, [cm, value]);

  useMount(() => {
    const CodeMirror = require('codemirror');
    require('codemirror/mode/markdown/markdown');
    require('codemirror/mode/sass/sass');
    cm.current = CodeMirror(editor.current as HTMLElement, {
      value,
      lineWrapping: true,
      readOnly,
      theme: 'material-darker',
      mode,
    });
    if (ref) {
      (ref as MutableRefObject<Editor | undefined>).current = cm.current;
    }
  });
  return <div className={classes.editor} ref={editor} />;
});

export default CodeEditor;
