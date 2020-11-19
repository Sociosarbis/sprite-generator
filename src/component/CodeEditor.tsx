import CodeMirror from 'codemirror';
import React from 'react';
import { useRef } from 'react';
import { useMount } from 'src/hooks/lifeCycles';
import { makeStyles } from '@material-ui/core';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/sass/sass';

const useStyles = makeStyles({
  editor: {
    '& .CodeMirror': {
      height: 'auto',
    },
  },
});

const CodeEditor: React.FC<{
  value: string;
  mode: string;
  readOnly?: boolean;
}> = ({ value, mode, readOnly }) => {
  const classes = useStyles({});
  const editor = useRef<HTMLDivElement>(null);
  const cm = useRef<ReturnType<typeof CodeMirror>>();

  useMount(() => {
    cm.current = CodeMirror(editor.current as HTMLElement, {
      value,
      lineWrapping: true,
      readOnly,
      theme: 'material-darker',
      mode,
    });
    cm.current.on('copy', (inst, e) => {
      e.preventDefault();
      e.clipboardData && e.clipboardData.setData('text/plain', inst.getValue());
    });
  });
  return <div className={classes.editor} ref={editor} />;
};

export default CodeEditor;
