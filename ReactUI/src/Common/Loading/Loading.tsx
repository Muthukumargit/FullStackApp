import { Box, CircularProgress, Typography } from '@mui/material'
interface loadingProp{
show:boolean,
message:string
}

const Loading = ({show,message}:loadingProp) => {
  return (
    show ? (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh" // full height if you want center screen
      >
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          {message || 'Loading...'}
        </Typography>
      </Box>
    ) : null
  )
}

export default Loading