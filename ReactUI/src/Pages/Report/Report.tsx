import { Alert } from "@mui/material"

const Report = () => {
  return (
    <>
     {/* <Stack sx={{ width: '100%' }} spacing={2}> */}
    <Alert variant="filled" sx={{display:"flex",justifyContent:"center",p:2,m:2}}  severity="info">
        This page is under Development...
    </Alert>
    {/* </Stack> */}
        {/* <div>Report</div> */}
    </>
    
  )
}

export default Report