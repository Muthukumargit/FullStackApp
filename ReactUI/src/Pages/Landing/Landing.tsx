import { useEffect, useState } from "react";
import './Landing.css'
import { Alert, Box, Button, Snackbar, Tooltip } from "@mui/material";
import sendHTTPRequest from "../../Common/Utils/HttpWrappers";
import { useAppSelector } from "../../Common/Store/hooks";
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CustDrawer from "../Drawer/CustDrawer";
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { TaskDetails, UpdateTaskDetails } from "../../Common/DataModels/TaskDetails";
import EditModal from "../EditModal/EditModal";
import type { JSX } from "react/jsx-runtime";
import Loading from "../../Common/Loading/Loading";

dayjs.extend(utc);
dayjs.extend(timezone);


const Landing = () => {

  const userprofile = useAppSelector(state => state.profile);
  console.log("User Profile", userprofile);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [editDetails, setEditDetails] = useState(false);
  const [tableData, setTableData] = useState();
  const [showloading,setShowloading] = useState(false);

  const [open, setOpen] = useState(false);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    createdDate: false,
    createdBy: false,
    updatedDate: false,
    assignedByUserName: false
  });
  useEffect(() =>{
    getAllDetails();
  },[])

  useEffect(()=>{
   setShowloading(true); 
  },[])

  const [taskForm, setTaskForm] = useState<TaskDetails>({
    taskType: '',
    taskDescription: '',
    taskName: '',
    assignedToUserId: '',
    addAdminUsers: false,
    dueDate: ''// Initialize with current date
  });
  const [UpdateTaskDetails, setUpdateTaskDetails] = useState<UpdateTaskDetails>({
    ticketId: '',
    taskType: { taskCode: '', taskType: '' },
    taskDescription: '',
    taskName: '',
    assignedTo: { userId: '', userName: '' },
    addAdminUsers: false,
    dueDate: '',
    status: { status: '', statusCd: '' },
    taskFeedback: '',
    assignedBy: { userId: '', userName: '' },
    taskFeedbackList: ''
  });
  const handleClose = () => {
    // setOpen(false); 
    // alert("Drawer closed");
    setOpen(false);
    setTaskForm({
      taskType: '',
      taskDescription: '',
      taskName: '',
      assignedToUserId: '',
      addAdminUsers: false,
      dueDate: ''
    });
    setUpdateTaskDetails({
      ticketId: '',
      taskType: { taskCode: '', taskType: '' },
      taskDescription: '',
      taskName: '',
      assignedTo: { userId: '', userName: '' },
      addAdminUsers: false,
      dueDate: '',
      status: { statusCd: '', status: '' },
      taskFeedback: '',
      assignedBy: { userId: '', userName: '' },
      taskFeedbackList: ''
    });
    // e.preventDefault();
    // e.stopPropagation();
  }

  const handleCreateTask = async (updatedForm: TaskDetails) => {
    // e.preventDefault();
    debugger;
    console.log('Add form ', updatedForm);
    setTaskForm(updatedForm);
    console.log("Creating task with form data", taskForm);
    if (!updatedForm.taskType || !updatedForm.taskName || !updatedForm.assignedToUserId) {
      alert("Please fill all required fields");
      return;
    }
    const response = await sendHTTPRequest(window.location.origin + '/userservice/createTask', {
      method: 'POST',
      body: JSON.stringify(updatedForm)
    });
    if (response.ok) {
      if (response.status === 200) {
         const data = await response.text();
        setSnackbarMessage(data);
        setSnackbarSeverity('success');
        setShowSnackbar(true);       
        console.log("Task created successfully", data);
        setOpen(false);
        setTaskForm({
          taskType: '',
          taskDescription: '',
          taskName: '',
          assignedToUserId: '',
          addAdminUsers: false,
          dueDate: ''
        });
      }

    } else {
      setSnackbarMessage("Error creating task: " + response.statusText);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      console.error("Failed to create task", response.statusText);

    }
  }
  const getAllDetails = async () => {
    // setShowloading(true)
    let customUrl = '/userservice/getUserTasks';
    console.log(userprofile.profile)
    if (userprofile.profile?.roles.includes('ADMIN')) {
      customUrl = '/userservice/getAllTasks';
    }
    console.log('custom URL ', customUrl);
    const response = await sendHTTPRequest(window.location.origin + customUrl, {
      method: 'GET'
    });

    if (response.ok) {

      if (response.status == 200) {
        const data = await response.json();
        setShowloading(false); 
        console.log(data);
        const flatData = data.map((item: any) => ({
          ticketId: item.ticketId,
          taskName: item.taskName,
          taskDescription: item.taskDescription,
          taskFeedback: item.taskFeedback,
          taskType: item.taskType?.typeDesc || item.taskType?.type || '',
          taskTypeCode: item.taskType?.type || '', // <-- keep this for later use
          assignedToUserName: item.assignedTo?.userName || item.assignedTo?.userId || '',
          assignedToUserId: item.assignedTo?.userId || '', // <-- keep this for later use
          status: item.status?.status || '',
          statusCd: item.status?.statusCd || '', // <-- keep this for later use
          dueDate: item.dueDate,
          assignedByUserName: item.assignedBy?.userName || '',
          assignedByUserId: item.assignedBy?.userId || '',
          createdBy: item.createdBy,
          createdDate: item.createdDate,
          updatedDate: item.updatedDate,
        }));
        setTableData(flatData);
        console.log('data for all the details', flatData);
        setShowloading(false); 
      }

    }
  }
  const formatjson = (data: string): JSX.Element => {
  let parsed: any[] = [];

  try {
    parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      return <div style={{ color: '' }}>No Feedback</div>;
    }
  } catch (e) {
    return <div style={{ color: 'red' }}>Invalid JSON</div>;
  }

  const feedback = parsed[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>

       <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {feedback.feedbackBy} — {new Date(feedback.feedbackAt).toLocaleString()} - {feedback.status}
        </div>
        <div style={{ whiteSpace: "pre-line" }}>{feedback.feedback}</div>
    </div>
  );
};

  const columns: GridColDef[] = [
    { field: 'ticketId', headerName: 'Ticket ID', width: 130, disableColumnMenu: true, },
    { field: 'taskName', headerName: 'Task Name', width: 130 },
    { field: 'taskDescription', headerName: 'Task Description', width: 200 },
    { field: 'taskFeedback', headerName: 'Task Feedback', width: 300,
      display:'flex',
      renderCell:(params) =>(
        formatjson(params.row.taskFeedback)
      )

     },
    { field: 'taskType', headerName: 'Task type', width: 150 },
    {
      field: 'assignedToUserName', headerName: 'Assigned TO', width: 200,
      renderCell: (params) => (
        <Tooltip title={params.row.assignedToUserId || ''} >
            {params.value}
        </Tooltip>
      ),
    },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'dueDate', headerName: 'Due Date', width: 150 },
    {
      field: 'assignedByUserName', headerName: 'Assigned BY', width: 200,renderCell: (params) => (
        <Tooltip title={params.row.assignedByUserId || ''}>
            {params.value}
        </Tooltip>
      ),
    },
    { field: 'createdBy', headerName: 'Created BY', width: 130 },
    { field: 'createdDate', headerName: 'Created At', width: 130 },
    { field: 'updatedDate', headerName: 'Updated At', width: 130 },

  ]




  // @ts-ignore
  const handleEditRow = (tableData: tableData) => {
    setUpdateTaskDetails({
      ticketId: tableData.ticketId,
      taskType: { taskCode: tableData.taskTypeCode, taskType: tableData.taskType },
      taskDescription: tableData.taskDescription,
      taskName: tableData.taskName,
      assignedTo: { userId: tableData.assignedToUserId, userName: tableData.assignedToUserName },
      addAdminUsers: false,
      dueDate: tableData.dueDate,
      status: { statusCd: tableData.statusCd, status: tableData.status },
      taskFeedback: '',
      assignedBy: { userId: tableData.assignedByUserId, userName: tableData.assignedByUserName },
      taskFeedbackList: JSON.parse(tableData.taskFeedback)
    });
    setEditDetails(true);
  }
  return (
    <>
    {showloading && <Loading message="Loading Main page" show={true} /> }
    {!showloading && userprofile.profile && (
        <EditModal
          userProfile={userprofile.profile}
          show={editDetails}
          CloseModal={(status) => {
            if (status == "Success") {
              setShowSnackbar(true);
              setSnackbarMessage("Task Updated Successfully...!");
              setSnackbarSeverity("success");
              getAllDetails();
            } else if (status == "Failed") {
              setShowSnackbar(true);
              setSnackbarMessage("Failed to update the task");
              setSnackbarSeverity("error");
            }

            console.log(status);
            setEditDetails(!editDetails);
          }}
          updateForm={UpdateTaskDetails}
        />
      )}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={10000}
        onClose={() => {
          setShowSnackbar(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setShowSnackbar(false);
          }}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      

      <Box className="task-page"  sx={{ p: 2 }}>
        

        <Box className="task-table" sx={{minWidth:'400px'}}>
          <div className="admin-btn-grp">
          {userprofile.profile?.roles?.includes("ADMIN") && (
            <>
          <Button variant="contained" color="success" onClick={getAllDetails}>
              Get All Details
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Add Task
            </Button>
          </>
        )}
        </div>
          <DataGrid
            columns={columns}
            rows={tableData || []}
            showToolbar
            pageSizeOptions={[5, 10, 25, 50, 100]}
            initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
            onRowDoubleClick={(e) => handleEditRow(e.row)}
            onRowClick={(e) => handleEditRow(e.row)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) =>
              // @ts-ignore
              setColumnVisibilityModel(newModel)
            }
            getRowId={(row) => "id_" + row.ticketId}
            sx={{
              "& .MuiDataGrid-cell": {
                alignItems: "start",
                whiteSpace: "normal",
                wordBreak: "break-word",
              },
              width: "100%",
            }}
          />
        </Box>
      </Box>
      {userprofile.profile?.roles?.includes("ADMIN") && (
        <>
          <CustDrawer 
            show={open}
            createTask={handleCreateTask}
            onclose={handleClose}
          />
        </>
      )}
    </>
  );
}

export default Landing