import React, { useState } from "react";
import type { FormEvent } from "react";
import "./Login.css"; // Assuming you use a CSS file for styling
import { useAppDispatch } from "../../Common/Store/hooks";
import { setUser } from "../../Common/Store/userSlice";
import { NavLink, useNavigate } from "react-router-dom";
// import { getCsrfTokenFromCookie } from '../../Common/Utils/csrf';
import sendHTTPRequest from "../../Common/Utils/HttpWrappers";
import { updateLastLoggedin } from "../../Common/auth/userLoader";
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Loading from "../../Common/Loading/Loading";

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState("");
  const [showloading,setShowloading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  // const [showPasswordconfirm, setShowPasswordConfirm] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  // const handleClickShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordconfirm);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };
  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };
  const dispatcher = useAppDispatch();
  // const user=useAppSelector((state) => state.user);
  const navigate = useNavigate();

  // useEffect(()=>{

  //   sendHTTPRequest(window.location.origin+'/userService/{path}',{

  //   })
  //   const csrf=getCsrfTokenFromCookie();
  //   console.log('csrf ::',csrf);
  // });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setShowloading(true);

    try {
      // const response1 = await fetch(window.location.origin+'/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   //   'X-CSRF-TOKEN': csrfToken,
      //   },
      //   credentials: 'include',
      //   body: JSON.stringify({ userId, password }),
      // });

      const response = await sendHTTPRequest(
        window.location.origin + "/login",
        {
          method: "POST",
          body: JSON.stringify({ userId, password }),
        }
      );

      if (response.ok) {
        debugger;

        const data = await response.json();

        console.log(data);
        debugger;
        dispatcher(setUser(data));
        // window.location.href = '/UI/';
        updateLastLoggedin();
        setShowloading(false);
        navigate("/UI/");
      } else {
        const message = await response.text();
        setError(message || "Invalid credentials");
        setShowloading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setShowloading(false);
    }
  };

  return (
    <>
    { showloading && <Loading show={true} message='Starting Up Render server... it might take some time' />}
    { !showloading && 
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">LOGIN</div>

        <div className="login-part">
          <TextField
            id="outlined-basic"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            fullWidth
            label="User Name"
            variant="outlined"
          />
          {/* <TextField id="outlined-basic" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth label="Password" variant="outlined" /> */}

          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              value={password}
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          
          {error && <div className="error">{error}</div>}
          <div className="btn-grp">
            <Button fullWidth type="submit" color="primary" variant="contained">
              Login
            </Button>
            <NavLink to="/UI/register" key={"user"} id={"navigate-user"}>
              {" "}
              Sign Up{" "}
            </NavLink>
          </div>
        </div>
      </form>
    </div>
    }
    </>
  );
};

export default LoginPage;
