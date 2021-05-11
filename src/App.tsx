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
  }, []);
  return <Home />;
}

export default App;
