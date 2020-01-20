import React, { useState, useEffect } from 'react'
import cls from 'classnames'
import { Drawer, Button, Link, Divider, makeStyles } from '@material-ui/core'

const links = [{
    name: '图片压缩',
    href: 'https://tinypng.com/'
},
{
    name: 'SCSS转CSS',
    href: 'https://www.sassmeister.com/'
}
]

const useStyles = makeStyles({
    fixTopLeft: {
        position: 'fixed',
        top: '20px',
        left: '20px'
    },
    commonPadding: {
        padding: '10px 20px'
    },
    drawerButton: {
        display: 'none'
    },
    '@media (max-width: 1280px)': {
        drawerButton: {
            display: 'initial'
        }
    }
})

function isBigScreen() {
    return window.innerWidth > 1280
}
export default function ExtraFeatures() {
    const classes = useStyles()
    const [showDrawer, setDrawer] = useState(isBigScreen())
    const [drawerType, setDrawType] = useState(isBigScreen() ? 'permanent' : 'temporary')
    useEffect(() => {
        window.addEventListener('resize', function () {
            if (isBigScreen()) {
                setDrawer(true)
            }
            setDrawType(isBigScreen() ? 'permanent' : 'temporary')
        })
    }, [])
    return <div>
        {
            !showDrawer ? <Button variant="contained" color="primary" className={cls(classes.fixTopLeft, classes.drawerButton)} onClick={() => setDrawer(true)}>支援功能</Button> : null
        }
        <Drawer variant={drawerType} open={showDrawer} onClose={() => setDrawer(false)}>
            <div className={classes.commonPadding}>支援功能</div>
            <Divider />
            {
                links.map((li) => <Link className={classes.commonPadding} key={li.name} href={li.href} target={li.name}>{li.name}</Link>)
            }
        </Drawer>
    </div>
}