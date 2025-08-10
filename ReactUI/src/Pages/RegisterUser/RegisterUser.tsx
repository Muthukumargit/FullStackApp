import { Alert, Button, CircularProgress, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput } from "@mui/material";
import "./RegisterUser.css";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import sendHTTPRequest from "../../Common/Utils/HttpWrappers";
import Verified from "@mui/icons-material/Verified";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import Snackbar from "@mui/material/Snackbar";
import { NavLink } from "react-router-dom";

interface registerationForm {
   userId: string;
   firstName: string;
   lastName: string;
   email: string;
   password: string;
   // phoneNumber?: string
}

const Registeruser = () => {
   const [confirmPassword, setConfirmPassword] = useState("");
   const [verifinguserId, setVerifingUserId] = useState(false);
   const [isUserVerified, setIsUserVerified] = useState(false);
   const [isUserIdValid, setIsUserIdValid] = useState(false);
    const [verifingEmail, setVerifingEmail] = useState(false);
   const [isEmailVerified, setIsEmailVerified] = useState(false);
   const [isEmailValid, setIsEmailValid] = useState(false);
   const [showSnackbar, setShowSnackbar] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState("");
   const [snanackbartype, setSnackbarType] = useState<"success" | "error">("success");

   const [showPassword, setShowPassword] = useState(false);
   const [showPasswordconfirm, setShowPasswordConfirm] = useState(false);

   const [emailError, setEmailError] = useState(false);
   const [emailHelperText, setEmailHelperText] = useState("");

   const handleClickShowPassword = () => setShowPassword(!showPassword);
   const handleClickShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordconfirm);
   const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
   };
   const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
   };

   const [registerForm, setRegisterForm] = useState<registerationForm>({
      userId: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      // phoneNumber: ''
   });

   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegisterForm({
         ...registerForm,
         [e.target.name]: e.target.value,
      });
   };

   const handleVerifyEmail = (email : string) =>{
      setVerifingEmail(true);
      sendHTTPRequest(`${window.location.origin}/verifyEmail`,{
         method:"POST",
         body: email,
      }).then((response) => {
         if(response.ok){
            setVerifingEmail(false);
            if(response.status === 200){
               response.text().then((data) =>{
                  setVerifingEmail(true);
                  if(data === "Email is availble"){
                     setSnackbarType("success")
                  setShowSnackbar(true);
                           setSnackbarMessage("Email is available to take");
                           setVerifingEmail(false);
                           setIsEmailValid(true);
                           setIsEmailVerified(true);
                        } else {
                           // debugger;
                           setShowSnackbar(true);
                           setSnackbarType("error");
                           setSnackbarMessage("Email is not available to take");
                           setVerifingEmail(false);
                           setIsEmailVerified(true);
                           setIsEmailValid(false);
                        }
               });
            }else{
               setVerifingEmail(false);
            }
         }
      })
   }

   const handleverifyUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
      const userId = e.target.value;
      // debugger;
      if (userId) {
         setVerifingUserId(true);
         sendHTTPRequest(`${window.location.origin}/verifyUserId`, {
            method: "POST",
            body: userId,
         })
            .then((response) => {
               if (response.ok) {
                  setVerifingUserId(false);
                  // setIsUserIdValid(userId.length >= 5);
                  if (response.status === 200) {
                     // debugger;
                     response.text().then((data) => {
                        // debugger;
                        setVerifingUserId(true);
                        // console.log("User ID verification response:", data);
                        if (data === "User ID is availble") {
                           setSnackbarType("success");
                           setShowSnackbar(true);
                           setSnackbarMessage("User ID is available to take");
                           setVerifingUserId(false);
                           setIsUserIdValid(true);
                           setIsUserVerified(true);
                        } else {
                           // debugger;
                           setShowSnackbar(true);
                           setSnackbarType("error");
                           setSnackbarMessage("User ID is not available to take");
                           setVerifingUserId(false);
                           setIsUserVerified(true);
                           setIsUserIdValid(false);
                        }
                     });
                  } else {
                     setVerifingUserId(false);
                  }
               }
            })
            .catch((error) => {
               console.error("Error verifying user ID:", error);
            });
      }
   };

   const handleconfirmpassword = (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
   };
   const hanldeSubmit = () => {
      if (registerForm.password !== confirmPassword) {
         setSnackbarType("error");
         setSnackbarMessage("Passwords do not match");
         setShowSnackbar(true);
         return;
      }
      if (!isUserIdValid) {
         setSnackbarType("error");
         setSnackbarMessage("Please verify the User ID");
         setShowSnackbar(true);
         return;
      }
      sendHTTPRequest(`${window.location.origin}/register`, {
         method: "POST",
         body: JSON.stringify(registerForm),
      })
         .then((response) => {
            if (response.ok) {
               if (response.status === 200) {
                  setSnackbarType("success");
                  setSnackbarMessage("Registration successful");
                  setShowSnackbar(true);
                  setIsUserIdValid(false); // Reset form
                  setRegisterForm({
                     userId: "",
                     firstName: "",
                     lastName: "",
                     email: "",
                     password: "",
                  });
                  setConfirmPassword("");
               }
            } else {
               response.text().then((data) => {
                  setSnackbarType("error");
                  setSnackbarMessage(data || "Registration failed");
                  setShowSnackbar(true);
               });
            }
         })
         .catch((error) => {
            console.error("Error during registration:", error);
            setSnackbarType("error");
            setSnackbarMessage("Registration failed");
            setShowSnackbar(true);
         });
   };

   const validateEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!regex.test(email)) {
         setEmailError(true);
         setEmailHelperText("Enter a valid email address");
      } else {
         setEmailError(false);
         setEmailHelperText("");
         handleVerifyEmail(email);
      }
   };

   const isFormValid = () => {
      return (
         registerForm.userId.trim() !== "" &&
         registerForm.firstName.trim() !== "" &&
         registerForm.lastName.trim() !== "" &&
         registerForm.email.trim() !== "" &&
         registerForm.password.trim() !== "" &&
         confirmPassword.trim() !== "" &&
         registerForm.password === confirmPassword &&
         !emailError &&
         isUserIdValid && isEmailValid
      );
   };
   return (
      <>
         <span>
            <Grid container>
               <div className="registeration-page">
                  <div className="registeration-form">
                     <h3>Register</h3>
                     <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)}>
                        <Alert onClose={() => setShowSnackbar(false)} severity={snanackbartype} variant="filled" sx={{ width: "100%" }}>
                           {snackbarMessage}
                        </Alert>
                     </Snackbar>
                     <div>
                        <FormControl sx={{ m: 1, width: "50ch" }} fullWidth variant="outlined">
                           <InputLabel htmlFor="outlined-adornment-userid">UserId</InputLabel>
                           <OutlinedInput
                              value={registerForm?.userId}
                              name="userId"
                              onChange={handleFormChange}
                              id="outlined-adornment-userid"
                              endAdornment={
                                 <>
                                    {verifinguserId ? (
                                       <CircularProgress size={20} color="info" />
                                    ) : isUserVerified ? (
                                       isUserIdValid && registerForm.userId.length > 0 ? (
                                          <Verified color="success" />
                                       ) : registerForm.userId.length > 0 ? (
                                          <NewReleasesIcon color="error" />
                                       ) : null
                                    ) : null}
                                 </>
                              }
                              label="UserId"
                              // @ts-ignore
                              onBlur={handleverifyUserId}
                              onFocus={() => {
                                 setVerifingUserId(false);
                                 setIsUserIdValid(false);
                                 setIsUserVerified(false);
                              }}
                           />
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "50ch" }} fullWidth variant="outlined" error={emailError}>
                           <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
                           <OutlinedInput
                              value={registerForm?.email}
                              name="email"
                              onChange={handleFormChange}
                              onBlur={(e) => validateEmail(e.target.value)}
                              id="outlined-adornment-email"
                               endAdornment={
                                 <>
                                    {verifingEmail ? (
                                       <CircularProgress size={20} color="info" />
                                    ) : isEmailVerified ? (
                                       isEmailValid && registerForm.email.length > 0 ? (
                                          <Verified color="success" />
                                       ) : registerForm.email.length > 0 ? (
                                          <NewReleasesIcon color="error" />
                                       ) : null
                                    ) : null}
                                 </>
                              }
                              label="email"
                           />
                           {emailError && <p style={{ color: "red", margin: "3px 14px 0" }}>{emailHelperText}</p>}
                        </FormControl>
                     </div>
                     <div>
                        <FormControl sx={{ m: 1, width: "50ch" }} fullWidth variant="outlined">
                           <InputLabel htmlFor="outlined-adornment-firstname">First Name</InputLabel>
                           <OutlinedInput value={registerForm?.firstName} name="firstName" onChange={handleFormChange} id="outlined-adornment-firstname" label="firstname" />
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "50ch" }} fullWidth variant="outlined">
                           <InputLabel htmlFor="outlined-adornment-lastname">LastName</InputLabel>
                           <OutlinedInput value={registerForm?.lastName} name="lastName" onChange={handleFormChange} id="outlined-adornment-lastname" label="lastname" />
                        </FormControl>
                     </div>
                     <div>
                        <div>
                           <div>
                              <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
                                 <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                 <OutlinedInput
                                    value={registerForm?.password}
                                    id="outlined-adornment-password"
                                    type={showPassword ? "text" : "password"}
                                    endAdornment={
                                       <InputAdornment position="end">
                                          <IconButton
                                             aria-label={showPassword ? "hide the password" : "display the password"}
                                             onClick={handleClickShowPassword}
                                             onMouseDown={handleMouseDownPassword}
                                             onMouseUp={handleMouseUpPassword}
                                             edge="end"
                                          >
                                             {showPassword ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                       </InputAdornment>
                                    }
                                    label="Password"
                                    name="password"
                                    onChange={handleFormChange}
                                 />
                              </FormControl>

                              <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
                                 <InputLabel htmlFor="outlined-adornment-confirmpassword">Confirm Password</InputLabel>
                                 <OutlinedInput
                                    required={true}
                                    id="outlined-adornment-confirmpassword"
                                    type={showPasswordconfirm ? "text" : "password"}
                                    endAdornment={
                                       <InputAdornment position="end">
                                          <IconButton
                                             aria-label={showPasswordconfirm ? "hide the password" : "display the password"}
                                             onClick={handleClickShowPasswordConfirm}
                                             onMouseDown={handleMouseDownPassword}
                                             onMouseUp={handleMouseUpPassword}
                                             edge="end"
                                          >
                                             {showPasswordconfirm ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                       </InputAdornment>
                                    }
                                    label="Confirm Password"
                                    value={confirmPassword}
                                    name="confirmPassword"
                                    onChange={handleconfirmpassword}
                                 />
                              </FormControl>
                           </div>
                           <div className="reg-btn-grp">
                              <Button
                                 variant="contained"
                                 color="primary"
                                 disabled={!isFormValid()}
                                 onClick={() => {
                                    hanldeSubmit();
                                 }}
                              >
                                 Register
                              </Button>
                              <Button
                                 variant="outlined"
                                 color="secondary"
                                 type="reset"
                                 onClick={() => {
                                    setRegisterForm({ userId: "", firstName: "", lastName: "", email: "", password: "" });
                                    setConfirmPassword("");
                                    setEmailError(false);
                                    setEmailHelperText("");
                                    
                                 }}
                              >
                                 Reset
                              </Button>
                              <Button variant="outlined" color="secondary">
                                 <NavLink to="/UI/login" key={"user"} id={"navigate-user"}>
                                    {" "}
                                    Back{" "}
                                 </NavLink>
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </Grid>
         </span>
      </>
   );
};

export default Registeruser;
