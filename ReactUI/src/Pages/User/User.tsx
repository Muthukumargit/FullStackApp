import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Alert,
   Box,
   Button,
   Checkbox,
   Chip,
   CircularProgress,
   FormControl,
   FormControlLabel,
   FormHelperText,
   InputLabel,
   MenuItem,
   Modal,
   OutlinedInput,
   Select,
   Snackbar,
   Tooltip,
   Typography,
} from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import "./User.css";
import { useEffect, useState } from "react";
import sendHTTPRequest from "../../Common/Utils/HttpWrappers";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import AddIcon from "@mui/icons-material/Add";
import type { userProfile } from "../../Common/Store/userProfileSlice";
import Verified from "@mui/icons-material/Verified";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Loading from "../../Common/Loading/Loading";

const User = () => {
   const [taskList, setTaskList] = useState<any[]>([]);
   const [selectedRole, setSelectedRole] = useState<string>("");
   const [roleList, setRoleList] = useState<any[]>([]);
   const [modalType, setModalType] = useState("");

   const [availableTaskForRole, setAvaiableTaskForRole] = useState<any[]>([]);
   const [TaggedTask, setTaggedTask] = useState<any[]>([]);
   const [selectedfromAvailable, setSelectedFromAvailable] = useState<string[]>([]);
   const [selectedfromtagged, setSelectedFromTagged] = useState<string[]>([]);
   const [showSnackbar, setShowSnackbar] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState("");
   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
   const [allRoleList, setAllRoleList] = useState([{ roleCd: "", roleName: "" }]);
   const [verifingRoleCd, setVerifingRoleCd] = useState(false);
   const [isRoleCdVerified, setIsRoleCdVerified] = useState(false);
   const [isRoleCdValid, setIsRoleCdValid] = useState(false);
   const [userList, setUserList] = useState<userProfile[]>([{ userId: "", firstName: "", lastName: "", lastLoggedIn: "", phone: 0, pushNotification: 0, roles: "" }]);
   const [roleUserMap, setRoleUserMap] = useState([{ roleCd: "", roleName: "", userIds: [] }]);
   const [deleteList,setDeleteList] = useState<any[]>([]);
   //  const[selecteduser,setSelectedUser]= useState<userProfile>({userId:'',
   //  firstName:'',
   //  lastName:'',
   //  lastLoggedIn:'',
   //  phone:0,
   //  pushNotification:0,
   //  roles:''});
   const [selecteduser, setSelectedUser] = useState<userProfile>();

   const [newRole, setNewRole] = useState({ roleCd: "", roleName: "" });

   const [open, setOpen] = useState(false);
   // const handleOpen = () => setOpen(true);
   const handleClose = () => setOpen(false);

   useEffect(() => {
      sendHTTPRequest(window.location.origin + "/userservice/allTasksType", { method: "GET" })
         .then((res) => {
            return res.json();
         })
         .then((res) => {
            setTaskList(res);
         });

      sendHTTPRequest(window.location.origin + "/userservice/getRoleTaskList", { method: "GET" })
         .then((res) => {
            return res.json();
         })
         .then((res) => {
            setRoleList(res);
         });
   }, []);

   useEffect(() => {
      getAllusers();
      getAllRoles();
   }, []);

   const getAllRoles = () => {
      sendHTTPRequest(window.location.origin + "/userservice/getAllRoles", { method: "GET" })
         .then((res) => {
            return res.json();
         })
         .then((res) => setAllRoleList(res));
   };

   const getAllusers = () => {
      sendHTTPRequest(window.location.origin + "/userservice/getAllUsers", { method: "GET" })
         .then((res) => {
            return res.json();
         })
         .then((res) => {
            // console.log("all users ", res);
            setUserList(res);
         });
   };

   useEffect(() => {
      const selected = roleList.find((item) => item.roleCd === selectedRole);
      const selectedTaskList = selected?.taskList || [];
      setAvaiableTaskForRole(taskList.filter((item) => !selectedTaskList.includes(item.type)));
      setTaggedTask(taskList.filter((item) => selectedTaskList.includes(item.type)));
      setSelectedFromAvailable([]);
      setSelectedFromTagged([]);
   }, [selectedRole, roleList, taskList]);

   const handleRoleTask = () => {
      // console.log("Current role ", selectedRole);
      // console.log("selected values :: ", TaggedTask);
      const selectedTask = TaggedTask.map((item) => item.type).join(",");
      // console.log("selected value ::", selectedTask);
      sendHTTPRequest(window.location.origin + "/userservice/updateRoleTaskTag", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ userRole: selectedRole, taggedTask: selectedTask }),
      })
         .then((res) => {
            return res.text();
         })
         .then((res) => {
            if (res === "SUCCESS") {
               setShowSnackbar(true);
               setSnackbarSeverity("success");
               setSnackbarMessage("Role Task Updated Successfully");
            } else {
               setShowSnackbar(true);
               setSnackbarSeverity("error");
               setSnackbarMessage("Failed to Update Role Task");
            }
         });
   };
   const handleUpdateRole = () => {
      const newRoleList = allRoleList
         .filter((item) => selecteduser?.roles?.includes(item.roleName))
         .map((item) => item.roleCd)
         .join(",");
      sendHTTPRequest(window.location.origin + "/userservice/updateRole", {
         method: "POST",
         body: JSON.stringify({ userId: selecteduser?.userId, roleList: newRoleList }),
      })
         .then((res) => {
            return res.text();
         })
         .then((res) => {
            getAllusers();
            if (res === "SUCCESS") {
               setShowSnackbar(true);
               setSnackbarSeverity("success");
               setSnackbarMessage("User Role Updated Successfully...!");
            } else {
               setShowSnackbar(true);
               setSnackbarSeverity("error");
               setSnackbarMessage("Failed to Update User Role");
            }
         });
   };
   const style = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 350,
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      p: 3,
   };
   // @ts-ignore
   const handleverifyRoleCd = (e) => {
      const roleCd = e.target.value;
      if (roleCd) {
         setVerifingRoleCd(true);
         sendHTTPRequest(window.location.origin + "/userservice/checkRoleCd", {
            method: "POST",
            body: roleCd.toUpperCase(),
         }).then((res) => {
            setVerifingRoleCd(false);
            // console.log(res);
            if (res.status === 200) {
               setSnackbarSeverity("success");
               setShowSnackbar(true);
               setSnackbarMessage("Role Code is available to Create");
               setVerifingRoleCd(false);
               setIsRoleCdValid(true);
               setIsRoleCdVerified(true);
            } else if (res.status === 400) {
               setShowSnackbar(true);
               setSnackbarSeverity("error");
               setSnackbarMessage("Role Code is not available to Create");
               setVerifingRoleCd(false);
               setIsRoleCdValid(false);
               setIsRoleCdVerified(true);
            }
            res.text();
         });
      } else {
         setVerifingRoleCd(false);
         setIsRoleCdValid(false);
         setIsRoleCdVerified(false);
      }
   };
   // @ts-ignore
   const handleFormChange = (e) => {
      // console.log("Entered into formchange");
      let { name, value } = e.target;
      value = value.toUpperCase();
      setNewRole({
         ...newRole,
         [name]: value,
      });
   };
   const handleAddRole = () => {
      sendHTTPRequest(window.location.origin + "/userservice/addRole", {
         method: "POST",
         body: JSON.stringify(newRole),
      }).then((res) => {
         if (res.status === 200) {
            setSnackbarSeverity("success");
            setShowSnackbar(true);
            setSnackbarMessage("Role Added");
            // setVerifingRoleCd(false);
            // setIsRoleCdValid(true);
            // setIsRoleCdVerified(true);
            getAllRoles();
            setOpen(false);
         } else if (res.status === 400) {
            setShowSnackbar(true);
            setSnackbarSeverity("error");
            setSnackbarMessage("Failed to Add Role");
         }
      });
   };
   const handleDeleteOption = async () => {
      setOpen(true);
      setModalType("Delete");
      const response = await sendHTTPRequest(window.location.origin + "/userservice/roleUserMap", { method: "GET" });

      if (response.ok) {
         const body = await response.json();
         console.log("Body ::", body);
         setRoleUserMap(body);
         console.log(roleUserMap);
      } else {
      }
   };
   // @ts-ignore
   const handleDeleteRoleSelect = (event) =>{
      const value=event.target.value
      const checked=event.target.checked;
     debugger;
         setDeleteList((prev) => {
            if(prev.includes(value) && checked)
               return prev.filter(role => role!==value);
            else
               return [...prev,value];
         });
         debugger;
   }
   const deleteRole = async () =>{
      const deleteData=deleteList.join(',')
      const response = await sendHTTPRequest(window.location.origin+'/userservice/deleteRole',
         {
            method:'POST',
            body:JSON.stringify(deleteData)
         }
      );
      if(response.ok){
         console.log('delete response ',response);
      }
   }
   return (
      <>
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
         <div className="user-content">
            <div className="user-main">
               <Accordion>
                  <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                     <Typography component="span">Manage user Role </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                     <div className="role-manage-area">
                        <div className="user-role-select">
                           <FormControl fullWidth>
                              <InputLabel id="demo-simple-select-label">User Id</InputLabel>
                              <Select
                                 labelId="demo-simple-select-label"
                                 id="demo-simple-select"
                                 value={selecteduser?.userId !== "" ? selecteduser?.userId : "Select User Id"}
                                 label="TaskType"
                                 onChange={(e) => {
                                    // debugger;
                                    setSelectedUser(userList.find((item) => item.userId == e.target.value));
                                 }}
                              >
                                 <MenuItem>Create/Delete Role(s)</MenuItem>
                                 {userList.map((item, index) => (
                                    <MenuItem key={index} value={item.userId}>
                                       {item.firstName}
                                    </MenuItem>
                                 ))}
                              </Select>
                              {!selecteduser && (
                                 <FormHelperText>
                                    Select <strong>User Id</strong> to assign/unassign role to user
                                 </FormHelperText>
                              )}
                              {selecteduser && (
                                 <FormHelperText>
                                    Select <strong>Create/Delete Role(s)</strong> option to Mange the New/Exisiting Role
                                 </FormHelperText>
                              )}
                           </FormControl>
                           <div className="chip-area">
                              {selecteduser && <h3>Existing user Role :</h3>}
                              {userList
                                 .filter((item) => selecteduser?.userId == item.userId)
                                 .map((item) =>
                                    item.roles.split(",").map((role, idx) => <Chip key={idx} color="success" variant="filled" label={role} style={{ marginRight: 4 }} />)
                                 )}
                           </div>
                        </div>
                        <div className="user-role-area">
                           {allRoleList.map((item, idx) => (
                              <div key={idx}>
                                 <FormControlLabel
                                    label={item.roleName}
                                    name={item.roleName}
                                    control={
                                       <Checkbox
                                          key={idx}
                                          disabled={selecteduser?.roles ? false : true}
                                          checked={selecteduser?.roles ? selecteduser.roles.includes(item.roleName) : false}
                                          onChange={() => {
                                             setSelectedUser(
                                                selecteduser && item.roleName
                                                   ? selecteduser.roles.includes(item.roleName)
                                                      ? {
                                                           ...selecteduser,
                                                           roles: selecteduser.roles
                                                              .split(",")
                                                              .filter((role) => role !== item.roleName)
                                                              .join(","),
                                                        }
                                                      : {
                                                           ...selecteduser,
                                                           roles: selecteduser.roles ? `${selecteduser.roles},${item.roleName}` : item.roleName,
                                                        }
                                                   : selecteduser
                                             );
                                          }}
                                       />
                                    }
                                 />
                              </div>
                           ))}
                           {!selecteduser && (
                              <div className="add-role-btn">
                                 <Button
                                    color="primary"
                                    onClick={() => {
                                       setOpen(true);
                                       setModalType("Add");
                                    }}
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                 >
                                    Add
                                 </Button>
                                 <Button color="error" onClick={handleDeleteOption} variant="contained" startIcon={<DeleteOutlineIcon />}>
                                    Delete
                                 </Button>
                              </div>
                           )}
                        </div>
                        {selecteduser?.userId && (
                           <div className="manage-role-button">
                              <Button variant="contained" color="primary" onClick={handleUpdateRole}>
                                 Update
                              </Button>
                              <Button variant="outlined" color="secondary">
                                 Cancel
                              </Button>
                           </div>
                        )}
                     </div>
                  </AccordionDetails>
               </Accordion>
               <Accordion>
                  <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                     <Typography component="span">Manage Role Task</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                     <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Role</InputLabel>
                        <Select
                           labelId="demo-simple-select-label"
                           id="demo-simple-select"
                           value={selectedRole}
                           label="TaskType"
                           onChange={(e) => {
                              setSelectedRole(e.target.value);
                           }}
                        >
                           <MenuItem>Select Role</MenuItem>
                           {roleList.map((item, index) => (
                              <MenuItem key={index} value={item.roleCd}>
                                 {item.roleName}
                              </MenuItem>
                           ))}
                        </Select>
                        {!selectedRole && <FormHelperText>Select Role to manage Assigned Task</FormHelperText>}
                        {selectedRole && (
                           <>
                              <div className="taskselect-main">
                                 <div className="taskselect-area">
                                    <div className="item-area">
                                       <div>Available Task</div>
                                       <div className="available-task">
                                          {availableTaskForRole.map((item, idx) => (
                                             <MenuItem
                                                key={idx}
                                                className={`available-item ${selectedfromAvailable.includes(item.type) ? "selected-item" : ""}`}
                                                onDoubleClick={() => {
                                                   if (selectedRole) {
                                                      setTaggedTask((prev) => [...prev, item]);
                                                      setAvaiableTaskForRole((prev) => prev.filter((t) => t.type !== item.type));
                                                   }
                                                }}
                                                onClick={() => {
                                                   if (selectedRole) {
                                                      setSelectedFromAvailable((prev) =>
                                                         prev.includes(item.type) ? prev.filter((type) => type !== item.type) : [...prev, item.type]
                                                      );
                                                      // console.log("selectedfromAvailable ", selectedfromAvailable);
                                                   }
                                                }}
                                             >
                                                {item.typeDesc || item.type}
                                             </MenuItem>
                                          ))}
                                       </div>
                                    </div>

                                    <div className="select-button-area">
                                       <KeyboardArrowRightIcon
                                          style={selectedRole ? { cursor: "pointer" } : { cursor: "no-drop", opacity: "0.5" }}
                                          onClick={() => {
                                             if (selectedRole) {
                                                const selectedTasks = availableTaskForRole.filter((item) => selectedfromAvailable.includes(item.type));
                                                setTaggedTask((prev) => [...prev, ...selectedTasks]);
                                                setAvaiableTaskForRole((prev) => prev.filter((item) => !selectedfromAvailable.includes(item.type)));
                                                setSelectedFromAvailable([]);
                                             }
                                          }}
                                       />
                                       <KeyboardDoubleArrowRightIcon
                                          style={selectedRole ? { cursor: "pointer" } : { cursor: "no-drop", opacity: "0.5" }}
                                          onClick={() => {
                                             if (selectedRole) {
                                                setTaggedTask(taskList);
                                                setAvaiableTaskForRole([]);
                                             }
                                          }}
                                       />
                                       <KeyboardDoubleArrowLeftIcon
                                          style={selectedRole ? { cursor: "pointer" } : { cursor: "no-drop", opacity: "0.5" }}
                                          onClick={() => {
                                             if (selectedRole) {
                                                setAvaiableTaskForRole(taskList);
                                                setTaggedTask([]);
                                             }
                                          }}
                                       />
                                       <KeyboardArrowLeftIcon
                                          style={selectedRole ? { cursor: "pointer" } : { cursor: "no-drop", opacity: "0.5" }}
                                          onClick={() => {
                                             if (selectedRole) {
                                                // Move selected from tagged to available
                                                const selectedTasks = TaggedTask.filter((item) => selectedfromtagged.includes(item.type));
                                                setAvaiableTaskForRole((prev) => [...prev, ...selectedTasks]);
                                                setTaggedTask((prev) => prev.filter((item) => !selectedfromtagged.includes(item.type)));
                                                setSelectedFromTagged([]);
                                             }
                                          }}
                                       />
                                    </div>
                                    <div className="item-area">
                                       <div>Selected Task</div>
                                       <div className="selected-task">
                                          {TaggedTask.map((item, idx) => (
                                             <MenuItem
                                                key={idx}
                                                className={`available-item ${selectedfromtagged.includes(item.type) ? "selected-item" : ""}`}
                                                onDoubleClick={() => {
                                                   if (selectedRole) {
                                                      setAvaiableTaskForRole((prev) => [...prev, item]);
                                                      setTaggedTask((prev) => prev.filter((t) => t.type !== item.type));
                                                   }
                                                }}
                                                onClick={() => {
                                                   if (selectedRole) {
                                                      setSelectedFromTagged((prev) =>
                                                         prev.includes(item.type) ? prev.filter((type) => type !== item.type) : [...prev, item.type]
                                                      );
                                                   }
                                                }}
                                             >
                                                {item.typeDesc || item.type}
                                             </MenuItem>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="button-area">
                                    <Button variant="contained" onClick={handleRoleTask}>
                                       Update
                                    </Button>
                                    <Button variant="outlined">Cancle</Button>
                                 </div>
                              </div>
                           </>
                        )}
                     </FormControl>
                  </AccordionDetails>
               </Accordion>
            </div>
         </div>

         <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={style}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  {modalType == "Add" ? "Add New Role" : "Delete Role"}
               </Typography>
               {modalType == "Add" && (
                  <div className="Add-role-main">
                     <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-userid">Role Code</InputLabel>
                        <OutlinedInput
                           value={newRole.roleCd}
                           name="roleCd"
                           onChange={(e) => {
                              handleFormChange(e);
                              if (newRole.roleCd.length != 0 || e.target.value != "") {
                                 handleverifyRoleCd(e);
                              }
                           }}
                           inputProps={{ maxLength: 1 }}
                           id="outlined-adornment-userid"
                           endAdornment={
                              <>
                                 {verifingRoleCd ? (
                                    <CircularProgress size={20} color="info" />
                                 ) : isRoleCdVerified ? (
                                    isRoleCdValid ? (
                                       <Verified color="success" />
                                    ) : (
                                       <NewReleasesIcon color="error" />
                                    )
                                 ) : null}
                              </>
                           }
                           label="Rode Code"
                           // @ts-ignore
                           onBlur={handleverifyRoleCd}
                           onFocus={() => {
                              setVerifingRoleCd(false);
                              setIsRoleCdValid(false);
                              setIsRoleCdVerified(false);
                           }}
                        />
                     </FormControl>
                     <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-Rolename">Role Name</InputLabel>
                        <OutlinedInput
                           value={newRole.roleName}
                           name="roleName"
                           onChange={handleFormChange}
                           id="outlined-adornment-roleName"
                           label="Role Name"
                           // @ts-ignore
                           // onBlur={handleverifyUserId}
                           onFocus={() => {
                              setVerifingRoleCd(false);
                              setIsRoleCdValid(false);
                              setIsRoleCdVerified(false);
                           }}
                        />
                     </FormControl>
                     <div className="add-role-btn-area">
                        <Button variant="contained" color="primary" onClick={handleAddRole} disabled={newRole?.roleCd !== "" && newRole?.roleName !== "" ? false : true}>
                           Create
                        </Button>
                        <Button variant="outlined" color="primary" onClick={handleClose}>
                           Close
                        </Button>
                     </div>
                  </div>
               )}
               {modalType == "Delete" && (
                  <>
                     <div>
                        <div className="delete-role-main">
                          
                           {roleUserMap[0].roleCd == '' ? (
                               <div className="delete-role-loading">
                              <Loading message="Loading Roles..." show />
                              </div>
                           ) :( roleUserMap.map((item, index) => {
                              const isDisabled = (item?.userIds || []).length > 0;
                              const labelText = `${item.roleName}${item.userIds?.length ? " - (" + item.userIds.toString() + ")" : ""}`;
                              const tooltipText = "Role should not be assigned to any users to be deleted";
                              return (
                                 <Tooltip key={index} title={tooltipText} disableHoverListener={!isDisabled}>
                                    <span className="user-role-map">
                                       <FormControlLabel label={labelText} name={item.roleName} control={<Checkbox value={item.roleCd} onChange={handleDeleteRoleSelect} disabled={isDisabled} />} />
                                       <hr></hr>
                                    </span>
                                 </Tooltip>
                              );
                           }))}
                        </div>
                        <div className="del-btn-area">
                           <Button variant="contained" color="error" onClick={deleteRole}> Delete</Button>
                           <Button variant="outlined" color="secondary" onClick={() =>setOpen(false)}> close</Button>
                        </div>
                     </div>
                  </>
               )}
            </Box>
         </Modal>
      </>
   );
};

export default User;
