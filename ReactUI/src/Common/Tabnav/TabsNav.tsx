import { NavLink } from "react-router-dom";
import "./TabsNav.css";
import { useEffect, useState, type ReactElement } from "react";
import sendHTTPRequest from "../Utils/HttpWrappers";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { fetchUserDetails } from "../auth/userLoader";
import UserDropdown from "../UserDropdown/UserDropdown";
import Notification from "../Notification/Notification";
import Message from "../Message/Message";
import { AppBar, Toolbar, Typography } from "@mui/material";

const TabsNav = () => {
   const [permittedpages, updatePermittedpages] = useState();

   const user = useAppSelector((state) => state.user);
   const userprofile = useAppSelector((state) => state.profile);
   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(fetchUserDetails());
   }, [dispatch]);

   useEffect(() => {
      // console.log("userprofile inside header load", userprofile);
      if (userprofile.fetched) {
         sendHTTPRequest(window.location.origin + "/userservice/headers", {
            method: "Get",
         })
            .then((res) => {
               if (res.ok) {
                  return res.text();
               }
            })
            .then((data) => {
               // console.log("data", data);
               // @ts-ignore
               const headerHtml = pupulateTabs(data.split(","));
               // @ts-ignore
               updatePermittedpages(headerHtml);
               // console.log(permittedpages);
            });
         // console.log(userprofile);
      }
   }, [userprofile.fetched]);

   useEffect(() => {
      if (user.isAuthenticated && !userprofile.fetched) {
         // console.log("fetching the user Details");
         dispatch(fetchUserDetails());
      }
   }, [user.isAuthenticated, userprofile.fetched, dispatch]);

   const pupulateTabs = (permittedTabs: string[]) => {
      const tabs: ReactElement[] = [];

      if (permittedTabs.includes("landing")) {
         tabs.push(
            <NavLink to="/UI/" end key={"home"} id={"navigate-home"} className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}>
               {" "}
               Home{" "}
            </NavLink>
         );
      }
      if (permittedTabs.includes("users")) {
         tabs.push(
            <NavLink to="/UI/user" key={"user"} id={"navigate-user"} className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}>
               {" "}
               Management{" "}
            </NavLink>
         );
      }
      if (permittedTabs.includes("attendence")) {
         tabs.push(
            <NavLink to="/UI/attendence" key={"attendence"} id={"navigate-attendence"} className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}>
               {" "}
               Attendence{" "}
            </NavLink>
         );
      }
      if (permittedTabs.includes("report")) {
         tabs.push(
            <NavLink to="/UI/report" key={"report"} id={"navigate-Reports"} className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}>
               {" "}
               Reports{" "}
            </NavLink>
         );
      }

      return tabs;
   };
   return (
      <div>
         {permittedpages ? (
            <>
               <div>
                  <AppBar className="appbar" color="default">
                     <AppBar className="appbar1" color="info">
                        <Toolbar>
                           <h3>Application</h3>
                           {userprofile.profile && (
                              <>
                                 <Notification userprofile={userprofile.profile} />
                                 <Message />
                              </>
                           )}
                           <UserDropdown onProfileRefresh={() => dispatch(fetchUserDetails())} profile={userprofile.profile} />
                        </Toolbar>
                     </AppBar>
                     <Toolbar />

                     <Toolbar>
                        <Typography variant="h6"> {permittedpages}</Typography>
                     </Toolbar>
                  </AppBar>
                  <Toolbar />
               </div>
               <Toolbar />
            </>
         ) : (
            <div></div>
         )}
       
      </div>
   );
};

export default TabsNav;
