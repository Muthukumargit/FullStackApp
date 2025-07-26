import React, { useEffect, useRef, useState } from "react";
import "./Notification.css"
import { Badge, Box, Portal } from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import type { userProfile } from "../Store/userProfileSlice";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import notificationosund from "../../assets/audio/bell-notification-337658.mp3";
import sendHTTPRequest from "../Utils/HttpWrappers";
import type { NotificationProps } from "../DataModels/NotifiactionDetails";
import dayjs from "dayjs";

interface notificationProp {
  userprofile: userProfile;
}

const Notification = ({ userprofile }: notificationProp) => {
  const [showNotification, setShowNotification] = React.useState(false);
  const notificationIconRef = useRef<HTMLDivElement | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const [notificationList, setNotificationList] = useState<NotificationProps[]>(
    []
  );
  const [badgeCount, setbadgeCount] = useState<number>(0);
  // const prevBadgeCountRef =useRef(0)
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      notificationIconRef.current &&
      !notificationIconRef.current.contains(target) &&
      notificationButtonRef.current &&
      !notificationButtonRef.current.contains(target)
    ) {
      setShowNotification(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    sendHTTPRequest(
      window.location.origin + "/userservice/getUserNotification",
      { method: "GET" }
    )
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        console.log("Notification ::", data);
        setNotificationList(data);
      });
  }, [userprofile.pushNotification]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${protocol}://${window.location.host}/userservice/ws/notifications?userId=${userprofile.userId}`
    );
    debugger;
    ws.onmessage = (event) => {
      const notif = JSON.parse(event.data);
      console.log("Notification Received:", notif);
      setNotificationList((prev) => [notif, ...prev]);
      setbadgeCount((prev) => prev + 1);
      if (userprofile.pushNotification === 1) ringNotification();
    };

    return () => ws.close();
  }, [userprofile.userId]);

  // useEffect(() => {
  //   if (!userprofile?.userId) return;

  //   const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  //   const ws = new WebSocket(`${protocol}://${window.location.host}/userservice/ws/notifications?userId=${userprofile.userId}`);

  //   ws.onmessage = (event) => {
  //     try {
  //       const notif = JSON.parse(event.data);
  //       console.log("Notification Received:", notif);

  //       setNotificationList(prev => [notif, ...prev]);

  //       // Only count it as a badge if it's a notification
  //       if (notif.type === 'notification') {
  //         setbadgeCount(prev => prev + 1);
  //       }

  //       if (userprofile.pushNotification === 1) {
  //         ringNotification(); // play sound
  //       }

  //     } catch (e) {
  //       console.error("Invalid WebSocket message:", event.data);
  //     }
  //   };

  //   ws.onerror = (e) => {
  //     console.error("WebSocket error:", e);
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, [userprofile.userId, userprofile.pushNotification]);

  // @ts-ignore
  const ringNotification = () => {
    // console.log("inside sound", prevBadgeCountRef.current, "new count:", newCount);
    // if (newCount > prevBadgeCountRef.current) {
    console.log("playing sound");
    const audio = new Audio(notificationosund);
    audio.play().catch((err) => console.warn("Audio play failed:", err));
    // }
    // prevBadgeCountRef.current = newCount;
  };
  //   useEffect(() =>{
  //     console.log(badgeCount,' ',prevBadgeCountRef.current);

  //     if(badgeCount>prevBadgeCountRef.current){
  // const audio=new Audio(notificationosund); audio.play();
  //     }
  //     prevBadgeCountRef.current=badgeCount;

  //   },[badgeCount])

  // const checkNotification = async () =>{
  //   // alert('Notification triggered');

  //   const response = await sendHTTPRequest(window.location.origin+'/userservice/getUserNotification',{method:'GET'});
  //   if(response.ok){
  //     if(response.status ===200){
  //       const data=await response.json();
  //       console.log('Notification ::',data);
  //         setNotificationList(data);
  //         console.log(notificationList.filter(n => n.readIn === 0).length);
  //         setbadgeCount(notificationList.filter(n => n.readIn === 0).length);
  //       console.log('Notification List ::',notificationList);
  //     }
  //   }

  //   console.log('Notification triggered');
  // }
  return (
    <>
      <div className="notification-main">
        <button
          ref={notificationButtonRef}
          className="notification-button"
          onClick={() => {
            setShowNotification(!showNotification);
          }}
        >
          <Badge badgeContent={badgeCount} color="success">
            {/* <i className="fa-regular fa-bell"></i> */}
            {userprofile.pushNotification === 1 ? (
              <NotificationsActiveOutlinedIcon fontSize="inherit" color="inherit"/>
            ) : (
              <NotificationsOffIcon fontSize="inherit" />
            )}
          </Badge>
        </button>
      </div>
      {/* <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}></Box> */}
      {showNotification && (
        <>
          <Portal>
            <div className="notification-icon">
              <div className="notification-header">
                <h3>Notifications</h3>

                <button
                  className="close-button"
                  onClick={() => {
                    setShowNotification(false);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <hr />
              </div>
              <Box className="notification-dropdown" ref={notificationIconRef} >
                {notificationList.map((item, index) => (
                    <div
                      key={index}
                      className="notification-item"
                      onClick={() => {
                        alert("Reading Notification " + item?.ticketId);
                      }}
                    >
                      <h4>
                        {item?.ticketId}
                        <span className="sub-msg">{item.message}</span>
                      </h4>
                      <span className="notification-time-sub">
                        {(() => {
                          const diff = dayjs().diff(
                            dayjs(item.notificationTs),
                            "minute"
                          );
                          if (diff < 1) return "Just now";
                          if (diff < 60) return `${diff} mins ago`;
                          const hours = Math.floor(diff / 60);
                          if (hours < 24)
                            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
                          const days = Math.floor(hours / 24);
                          return `${days} day${days > 1 ? "s" : ""} ago`;
                        })()}
                        {item.readIn === 0 ? (
                          <NotificationsActiveOutlinedIcon color="info" />
                        ) : (
                          <DoneAllOutlinedIcon color="info" />
                        )}
                      </span>
                    </div>
                  ))}
              </Box>

              {/* <div className="notification-dropdown" ref={notificationIconRef}>
                <div className="notification-list">
                  {notificationList.map((item, index) => (
                    <div
                      key={index}
                      className="notification-item"
                      onClick={() => {
                        alert("Reading Notification " + item?.ticketId);
                      }}
                    >
                      <h4>
                        {item?.ticketId}
                        <span className="sub-msg">{item.message}</span>
                      </h4>
                      <span className="notification-time-sub">
                        {(() => {
                          const diff = dayjs().diff(
                            dayjs(item.notificationTs),
                            "minute"
                          );
                          if (diff < 1) return "Just now";
                          if (diff < 60) return `${diff} mins ago`;
                          const hours = Math.floor(diff / 60);
                          if (hours < 24)
                            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
                          const days = Math.floor(hours / 24);
                          return `${days} day${days > 1 ? "s" : ""} ago`;
                        })()}
                        {item.readIn === 0 ? (
                          <NotificationsActiveOutlinedIcon color="info" />
                        ) : (
                          <DoneAllOutlinedIcon color="info" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </Portal>
        </>
      )}
    </>
  );
};

export default Notification;
