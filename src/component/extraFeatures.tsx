import React, { useState, useEffect } from 'react';
import cls from 'classnames';
import { Drawer, Button, Link, Divider, makeStyles } from '@material-ui/core';

const links = [
  {
    name: 'SCSS转CSS',
    href: 'https://www.sassmeister.com/',
  },
];

const useStyles = makeStyles(() => ({
  commonPadding: {
    padding: '10px 20px',
  },
  drawerButton: {
    display: 'none',
  },
  '@media (max-width: 1280px)': {
    drawerButton: {
      display: 'initial',
    },
  },
  borderRight: {
    borderRight: '1px solid #eee',
  },
}));

function isBigScreen() {
  return typeof window !== 'undefined' ? window.innerWidth > 1280 : true;
}
export default function ExtraFeatures() {
  const classes = useStyles({});
  const [showDrawer, setDrawer] = useState(false);
  const [drawerType, setDrawType] = useState<'permanent' | 'temporary'>(
    'temporary',
  );
  useEffect(() => {
    const handleResize = () => {
      if (isBigScreen()) {
        setDrawer(true);
      }
      setDrawType(isBigScreen() ? 'permanent' : 'temporary');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Content = (
    <div
      className={cls(
        'h-screen',
        'flex-none',
        'box-border',
        drawerType === 'permanent' ? ['mr-2', classes.borderRight] : '',
      )}
    >
      <div className={classes.commonPadding}>支援功能</div>
      <Divider />
      {links.map((li) => (
        <Link
          className={cls(classes.commonPadding, 'block')}
          key={li.name}
          href={li.href}
          target={li.name}
        >
          {li.name}
        </Link>
      ))}
    </div>
  );
  return (
    <>
      {drawerType === 'temporary' ? (
        <div className={cls(classes.commonPadding, 'flex-none', 'mr-2')}>
          <Button
            variant="contained"
            color="primary"
            className={classes.drawerButton}
            onClick={() => setDrawer(true)}
          >
            支援功能
          </Button>
        </div>
      ) : !showDrawer ? null : (
        Content
      )}
      <Drawer
        variant={drawerType}
        open={showDrawer}
        onClose={() => setDrawer(false)}
      >
        {Content}
      </Drawer>
    </>
  );
}
