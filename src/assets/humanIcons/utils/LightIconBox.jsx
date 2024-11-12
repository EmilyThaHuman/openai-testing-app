import { Box } from '@mui/material';
import React from 'react';

export const LightIconBox = function (props) {
  const { icon, ...rest } = props;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="50%"
      sx={{
        backgroundColor: '#fff',
        width: '38px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '5px',
        boxShadow: '0 3px 15px 5px rgb(49 97 255 / 10%)',
      }}
      {...rest}
    >
      {icon}
    </Box>
  );
};

export default LightIconBox;
