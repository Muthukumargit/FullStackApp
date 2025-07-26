import { Button, Checkbox, Drawer, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import type { TaskDetails } from "../../Common/DataModels/TaskDetails";
import { useEffect, useState } from "react";
import sendHTTPRequest from "../../Common/Utils/HttpWrappers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RestoreIcon from "@mui/icons-material/Restore";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";

interface DrawerProperties {
   show: boolean;
   // taskForm?:TaskDetails,
   createTask: (taskDetails: TaskDetails) => void;
   onclose: () => void;
}

const CustDrawer = ({ show, createTask, onclose }: DrawerProperties) => {
   const [taskList, setTaskList] = useState<any[]>([{ type: "", typeDesc: "" }]);
   const [eligibleTaskUserList, setEligibleTaskUserList] = useState<any[]>([{ userId: "", userName: "", userRole: "" }]);
   const [localForm, setLocalForm] = useState<any>({
      taskType: "",
      taskDescription: "",
      taskName: "",
      assignedToUserId: "",
      addAdminUsers: false,
      dueDate: "",
   });
   useEffect(() => {
      if (localForm.taskType) {
         loadEligibleUsers(localForm.addAdminUsers);
      }
   }, [localForm.taskType, localForm.addAdminUsers]);

   const loadEligibleUsers = async (addAdminUsers: boolean) => {
      //console.log("Loading eligible users for task type:", localForm.taskType);
      const response = await sendHTTPRequest(window.location.origin + "/userservice/eligibleUsers", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            taskType: localForm.taskType,
            addAdminUsers: addAdminUsers,
         }),
      });

      if (response.ok) {
         const data = await response.json();
         setEligibleTaskUserList(data);
      } else {
         console.error("Failed to load eligible users", response.statusText);
         alert("Failed to load eligible users: " + response.statusText);
      }
   };

   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      console.log(name, " ", value);
      setLocalForm({
         ...localForm,
         [e.target.name]: e.target.value,
      });
   };

   useEffect(() => {
      if (show) loadTasks();
   }, [show]);

   const loadTasks = async () => {
      // Logic to load tasks
      const response = await sendHTTPRequest(window.location.origin + "/userservice/allTasksType", {
         method: "GET",
      });

      if (response.ok) {
         if (response.status === 204) {
            setTaskList([]);
         } else if (response.status === 200) {
            const data = await response.json();
            setTaskList(data);
         } else {
            console.error("Failed to load tasks", response.statusText);
            alert("Failed to load tasks: " + response.statusText);
         }
      }
   };
   const shouldDisableDate = (date: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      return date < startDate;
   };
   return (
      <>
         <Drawer open={show} onClose={onclose} sx={{ overflowX: "scroll", overflowY: "scroll", maxWidth: "50px" }} anchor="left">
            <div className="drawer-content">
               <div className="drawer-header">
                  <h2>Create Task</h2>
                  <i className="fa fa-close close-icon" onClick={onclose} aria-hidden="true"></i>
               </div>

               <div className="drawer-body">
                  <form className="task-form">
                     <FormControl required sx={{ m: 1, width: "40ch" }} fullWidth variant="outlined">
                        <InputLabel id="demo-simple-select-required-label">Task Type</InputLabel>
                        <Select
                           labelId="demo-simple-select-required-label"
                           id="demo-simple-select-required"
                           name="taskType"
                           value={localForm.taskType}
                           label="Task Type"
                           //@ts-ignore
                           onChange={handleFormChange}
                        >
                           <MenuItem value="">
                              <em>Select Task Type</em>
                           </MenuItem>
                           {taskList.map((task, index) => (
                              <MenuItem key={index} value={task.type}>
                                 {task.typeDesc}
                              </MenuItem>
                           ))}
                        </Select>
                        <FormHelperText>Required</FormHelperText>
                     </FormControl>

                     <FormControl sx={{ m: 1, width: "40ch" }} fullWidth variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-taskName">Task Name</InputLabel>
                        <OutlinedInput value={localForm.taskName} name="taskName" onChange={handleFormChange} id="outlined-adornment-taskName" label="Task Name" />
                     </FormControl>
                     <FormControl sx={{ m: 1, width: "40ch" }} fullWidth variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-taskDescription">Task Description</InputLabel>
                        <OutlinedInput
                           sx={{ minHeight: "100px" }}
                           value={localForm.taskDescription}
                           name="taskDescription"
                           onChange={handleFormChange}
                           id="outlined-adornment-taskDescription"
                           label="Task Description"
                           multiline
                           maxRows={4}
                        />
                     </FormControl>
                     <FormControl sx={{ m: 1, width: "40ch" }} fullWidth variant="outlined">
                        <FormControlLabel
                           className="assign-to-user-label"
                           control={
                              <Checkbox
                                 value={localForm.addAdminUsers}
                                 checked={localForm.addAdminUsers}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setLocalForm({ ...localForm, addAdminUsers: true });
                                    } else {
                                       setLocalForm({ ...localForm, addAdminUsers: false });
                                    }
                                 }}
                              />
                           }
                           label="Add Admin users"
                        />
                     </FormControl>

                     <FormControl sx={{ m: 1, width: "40ch" }} fullWidth variant="outlined">
                        <InputLabel id="demo-simple-select-required-label">Assign To</InputLabel>
                        <Select
                           labelId="demo-simple-select-required-label"
                           id="demo-simple-select-required"
                           name="assignedToUserId"
                           label="Assign To"
                           // @ts-ignore
                           onChange={handleFormChange}
                           value={localForm.assignedToUserId}
                        >
                           <MenuItem value="">
                              <em>Select User</em>
                           </MenuItem>
                           {eligibleTaskUserList.length > 0 &&
                              eligibleTaskUserList.map((user, index) => (
                                 <MenuItem key={index} value={user.userId}>
                                    {user.userName} {user.userRole.length > 0 ? `(${user.userRole.toLowerCase()})` : ""}
                                 </MenuItem>
                              ))}
                        </Select>
                        <FormHelperText>Required</FormHelperText>
                     </FormControl>
                     <FormControl sx={{ m: 1, width: "40ch" }} fullWidth variant="outlined">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                           <DatePicker
                              label="Due Date"
                              value={localForm.dueDate ? dayjs(localForm.dueDate) : null}
                              // @ts-ignore
                              onChange={(newvalue) => {
                                 const localDate = newvalue?.tz("Asia/Kolkata").format("YYYY-MM-DD");
                                 //console.log("Selected Due Date", localDate);
                                 setLocalForm({
                                    ...localForm,
                                    dueDate: localDate ? localDate.toString() : "",
                                 });
                                 console.log("localdate ::", localDate);
                              }}
                              name="dueDate"
                              disablePast
                              shouldDisableDate={shouldDisableDate}
                              format="DD/MM/YYYY"
                              slotProps={{ field: { clearable: true } }}
                           />
                        </LocalizationProvider>
                     </FormControl>
                     <div className="form-actions">
                        {
                           // drawerType!='Update' &&
                           <>
                              <Button variant="contained" startIcon={<AddBoxIcon />} color="primary" onClick={() => createTask(localForm)}>
                                 Create Task
                              </Button>
                              <Button
                                 variant="outlined"
                                 startIcon={<RestoreIcon />}
                                 color="primary"
                                 onClick={() => {
                                    setLocalForm({
                                       taskType: "",
                                       taskDescription: "",
                                       taskName: "",
                                       assignedToUserId: "",
                                       addAdminUsers: false,
                                       dueDate: "",
                                    });
                                 }}
                              >
                                 Reset
                              </Button>
                           </>
                        }
                        <Button variant="outlined" color="primary" startIcon={<DisabledByDefaultIcon />} onClick={onclose}>
                           Cancel
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         </Drawer>
      </>
   );
};

export default CustDrawer;
