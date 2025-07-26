import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
} from "@mui/material";
import "./EditModal.css";
import type { UpdateTaskDetails } from "../../Common/DataModels/TaskDetails";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useState } from "react";
import sendHTTPRequest from "../../Common/Utils/HttpWrappers";
import dayjs from "dayjs";
import type { userProfile } from "../../Common/Store/userProfileSlice";

interface EditModalProps {
  updateForm: UpdateTaskDetails;
  show: boolean;
  CloseModal: (status: string) => void;
  userProfile: userProfile;
}

const EditModal = ({
  updateForm,
  show,
  CloseModal,
  userProfile,
}: EditModalProps) => {
  const statusMap: Record<string, string> = {
    O: "Open",
    P: "In Progress",
    R: "In Review",
    C: "Completed",
    H: "On Hold",
    X: "Cancelled",
    N: "NEW",
  };
  console.log("updatedForm ::", updateForm);
  const [localForm, setLocalForm] = useState<UpdateTaskDetails>({
    ticketId: "",
    taskType: { taskCode: "", taskType: "" },
    taskDescription: "",
    taskName: "",
    assignedTo: { userId: "", userName: "" },
    addAdminUsers: false,
    dueDate: "",
    status: { statusCd: "", status: "" },
    taskFeedback: "",
    assignedBy: { userId: "", userName: "" },
    taskFeedbackList: "",
  });
  const [taskList, setTaskList] = useState<any[]>([{ type: "", typeDesc: "" }]);
  const [eligibleTaskUserList, setEligibleTaskUserList] = useState<any[]>([
    { userId: "", userName: "", userRole: "" },
  ]);

  useEffect(() => {
    if (localForm.taskType.taskType) {
      loadEligibleUsers(localForm.addAdminUsers);
    }
  }, [localForm.taskType, localForm.addAdminUsers]);

  const loadEligibleUsers = async (addAdminUsers: boolean) => {
    //console.log("Loading eligible users for task type:", localForm.taskType);
    const response = await sendHTTPRequest(
      window.location.origin + "/userservice/eligibleUsers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskType: localForm.taskType.taskCode,
          addAdminUsers: addAdminUsers,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      setEligibleTaskUserList(data);
    } else {
      console.error("Failed to load eligible users", response.statusText);
      alert("Failed to load eligible users: " + response.statusText);
    }
  };

  const handleFormChange = (field: keyof UpdateTaskDetails, value: any) => {
    setLocalForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));

    console.log("field ", field, " value ", value);

    console.log("inside form change", localForm);
  };

  useEffect(() => {
    if (show) {
      setLocalForm(updateForm);
      loadTasks();
    }
  }, [show]);

  const loadTasks = async () => {
    // Logic to load tasks
    const response = await sendHTTPRequest(
      window.location.origin + "/userservice/allTasksType",
      {
        method: "GET",
      }
    );

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

  const handleUpdateTask = async () => {
    const response = await sendHTTPRequest(
      window.location.origin + "/userservice/updateTask",
      { method: "POST", body: JSON.stringify(localForm) }
    );

    if (response.ok) {
      console.log(response.status);
      if (response.status === 200) {
        const data = await response.text();
        // alert('body '+data);
        if (data === "Task Updated successfully") {
          CloseModal("Success");
        }
      } else {
        console.error("Failed to load tasks", response.statusText);
        // alert("Failed to load tasks: " + response.statusText);
        CloseModal("Failed");
      }
    }
  };

  function generateFeedbackHistory(feedback: any) {
    console.log("inside json ::", feedback);
    if (!feedback) return [];
    try {
      const json = feedback;
      if (Array.isArray(json)) {
        return json;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // function generateFeedbackHistory(feedback:any){
  // console.log(feedback);
  // debugger;
  // if(feedback){
  //   const json = JSON.parse(feedback);
  //   let FeedbackHostory;
  //         const result=json.forEach(element => {
  //           console.log(element.feedback,' feedback by ',element.feedbackBy,'   feedbackAt ',element.feedbackAt);
  //           FeedbackHostory = 'User :'+element.feedbackBy+' - Date :'+element.feedbackAt+'\n--------------Feed Back---------------\n'+element.feedback
  //           +'\n-----------------------------------------'
  //         });

  //         return json;
  // }
  //       }
  return (
    <div>
      <Dialog
        open={show}
        onClose={CloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        scroll={"paper"}
        className="dialog"
        // sx={{minWidth:'800px'}}
        maxWidth='lg'
      >
        <DialogTitle className="dialog-title" id="scroll-dialog-title">
          Update Task
        </DialogTitle>

        <DialogContent dividers={true}>
          {/* <DialogContentText
                        id="scroll-dialog-description"
                        tabIndex={-1}
                    > */}
          <div className="task-form">
            <Stack 
  // direction={{xs:"row",md:"row",sm:"row",lg:"column"}}
  direction={{ xs: 'column', sm: 'column' }}
  spacing={2}
  useFlexGap
  >
<FormControl required fullWidth sx={{minWidth:'30ch'}} variant="outlined">
                <InputLabel id="demo-simple-select-required-label">
                  Task Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-required-label"
                  id="demo-simple-select-required"
                  name="taskType"
                  value={localForm.taskType.taskCode ?? ""}
                  label="Task Type"
                  //@ts-ignore
                  onChange={(e) => {
                    const selected = taskList.find(
                      (t) => t.type === e.target.value
                    );
                    if (selected) {
                      handleFormChange("taskType", {
                        taskCode: selected.type,
                        taskType: selected.typeDesc,
                      });
                    }
                  }}
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
              <FormControl fullWidth sx={{minWidth:'30ch'}} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-taskName">
                  Task Name
                </InputLabel>
                <OutlinedInput
                  value={localForm.taskName}
                  name="taskName"
                  onChange={(e) => {
                    handleFormChange("taskName", e.target.value);
                  }}
                  id="outlined-adornment-taskName"
                  label="Task Name"
                />
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel htmlFor="outlined-adornment-taskDescription">
                  Task Description
                </InputLabel>
                <OutlinedInput
                  sx={{ minHeight: "100px" }}
                  value={localForm.taskDescription}
                  name="taskDescription"
                  onChange={(e) =>
                    handleFormChange("taskDescription", e.target.value)
                  }
                  id="outlined-adornment-taskDescription"
                  label="Task Description"
                  multiline
                  maxRows={4}
                />
              </FormControl>
               <FormControl variant="outlined">
                  <FormControlLabel
                    className="assign-to-user-label"
                    control={
                      <Checkbox
                        checked={localForm.addAdminUsers}
        onChange={(e) => {
          handleFormChange("addAdminUsers", e.target.checked);
        }}
                      />
                    }
                    label="Add Admin users"
                    title="Add Admin users "
                  />
                </FormControl>
              <FormControl variant="outlined">
                  <InputLabel id="demo-simple-select-required-label">
                    Assign To
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-required-label"
                    id="demo-simple-select-required"
                    name="assignedToUserId"
                    label="Assign To"
                    onChange={(e) => {
                      const selected = eligibleTaskUserList.find(
                        (u) => u.userId === e.target.value
                      );
                      if (selected) {
                        handleFormChange("assignedTo", {
                          userId: selected.userId,
                          userName: selected.userName,
                        });
                      }
                    }}
                    value={localForm.assignedTo.userId}
                  >
                    <MenuItem value="">
                      <em>Select User</em>
                    </MenuItem>
                    {eligibleTaskUserList.length > 0 &&
                      eligibleTaskUserList.map((user, index) => (
                        <MenuItem key={index} value={user.userId}>
                          {user.userName}{" "}
                          {user.userRole.length > 0
                            ? `(${user.userRole.toLowerCase()})`
                            : ""}
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>Required</FormHelperText>
                </FormControl>
               
                <FormControl variant="outlined">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    value={localForm.dueDate ? dayjs(localForm.dueDate) : null}
                    // @ts-ignore
                    onChange={(newvalue) => {
                      const localDate = newvalue
                        ?.tz("Asia/Kolkata")
                        .format("YYYY-MM-DD");

                      handleFormChange(
                        "dueDate",
                        localDate ? localDate.toString() : ""
                      );
                      //console.log("Selected Due Date", localDate);
                      //   setLocalForm({
                      //     ...localForm, dueDate: localDate ? localDate.toString() : '',
                      //   })
                    }}
                    name="dueDate"
                    disablePast
                    // shouldDisableDate={shouldDisableDate}
                    format="DD/MM/YYYY"
                    slotProps={{ field: { clearable: true } }}
                  />
                </LocalizationProvider>
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel id="demo-simple-select-required-label">
                  Status
                </InputLabel>

                <Select
                  value={localForm.status.statusCd}
                  // @ts-ignore
                  onChange={(e) =>
                    handleFormChange("status", {
                      statusCd: e.target.value,
                      status: statusMap[e.target.value],
                    })
                  }
                  name="status"
                  label="Status"
                >
                  {Object.entries(statusMap).map(([code, label]) => (
                    <MenuItem
                      key={code}
                      disabled={
                        !userProfile.roles.includes("ADMIN") &&
                        ["C", "X", "H"].includes(code)
                          ? true
                          : false
                      }
                      value={code}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
               <FormControl variant="outlined">
                <InputLabel htmlFor="outlined-adornment-Feedback">
                  Feedback
                </InputLabel>
                <OutlinedInput
                  sx={{ minHeight: "100px" }}
                  label="Feedback"
                  name="taskFeedback"
                  onChange={(e) =>
                    handleFormChange("taskFeedback", e.target.value)
                  }
                  className="feedback"
                  multiline
                  value={localForm?.taskFeedback}
                />
              </FormControl>
              <FormControl variant="outlined">
                <div className="Feedback-content">
                  <h4>Feedback History</h4>

                  <>
                    <div className="Feedback-histroy">
                      {generateFeedbackHistory(localForm?.taskFeedbackList).map(
                        (item, index) => (
                          <div className="Feedbacks" key={index} style={{}}>
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "4px",
                              }}
                            >
                              {item.feedbackBy} —{" "}
                              {new Date(item.feedbackAt).toLocaleString()} -{" "}
                              {item.status}
                            </div>
                            <div style={{ whiteSpace: "pre-line" }}>
                              {item.feedback}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                </div>
                {/* <div>
                                    <p>{generateFeedbackHistory(localForm?.taskFeedback)}</p>
                                  </div> */}
                {/*   <InputLabel htmlFor="outlined-adornment-Feedback">Feedback History</InputLabel>
                                    <OutlinedInput sx={{ minHeight: '100px' }}
                                        label="Feedback History"

                                        className='feedback-history' maxRows={3} multiline disabled
                                        value={generateFeedbackHistory(localForm?.taskFeedback)}
                                    // value={""}
                                    /> */}
              </FormControl>
             

  </Stack>
          </div>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateTask}
          >
            Update Task
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setLocalForm(updateForm);
            }}
          >
            Reset
          </Button>
          <Button
            variant="text"
            color="primary"
            onClick={() => {
              // setLocalForm(updateForm);
              CloseModal("Undefined");
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditModal;
