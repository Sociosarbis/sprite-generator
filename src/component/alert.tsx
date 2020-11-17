import React from 'react';
import { Dialog, DialogContent, List, ListItem } from '@material-ui/core';

const Alert: React.FC<{
  open: boolean;
  errors: string[];
  onClose: () => any;
}> = (props) => {
  const { errors, onClose, open } = props;
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogContent>
        <List>
          {errors.map((error, index) => (
            <ListItem key={index}>
              {index + 1}：{error}
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default Alert;
