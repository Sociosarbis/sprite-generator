import React from 'react'
import { Dialog, DialogContent, List, ListItem } from '@material-ui/core'


export default function Alert(props) {
    const { errors, onClose, open } = props
    return <Dialog onClose={onClose} open={open}>
        <DialogContent>
            <List>
            { errors.map((error, index) => <ListItem key={index}>{index + 1}：{error}</ListItem>)}
            </List>
            </DialogContent>
        </Dialog>
}