import React, { useEffect } from 'react';
import Home from './container/home';
import './index.css';
import './App.css';
import 'src/styles/base.scss';

function App() {
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }

    if (process.env.NODE_ENV === 'development') {
      const cssStyles = document.querySelectorAll('style[data-vue-ssr-id]');
      for (let i = 0; i < cssStyles.length; i++) {
        cssStyles[i].parentElement?.removeChild(cssStyles[i]);
      }
    }
  }, []);
  return <Home />;
}

export default App;
