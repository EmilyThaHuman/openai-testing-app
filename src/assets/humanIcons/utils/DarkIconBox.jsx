import { alpha, Box } from '@mui/material';
import React from 'react';

export const DarkIconBox = function (props) {
  const { icon, ...rest } = props;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="50%"
      sx={{
        backgroundColor: 'transparent',
        border: '1px solid #fff',
        color: '#fff',
        width: '38px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '5px',
        boxShadow: '0 3px 15px 5px rgb(49 97 255 / 10%)',
        transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s', // Smooth transition
        '&:hover': {
          backgroundColor: alpha('#fff', 0.2),
          color: '#000', // Change icon color on hover for contrast
          border: '1px solid #fff', // Ensure border is consistent
          boxShadow: '0 3px 15px 5px rgb(49 97 255 / 20%)', // Slightly stronger shadow on hover
        },
      }}
      {...rest}
    >
      {icon}
    </Box>
  );
};

export default DarkIconBox;
