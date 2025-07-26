import  { useState, useEffect, useRef } from 'react';
import './UserDropdown.css';
import sendHTTPRequest from '../Utils/HttpWrappers';
import { Portal, Switch } from '@mui/material';
import type { userProfile } from '../Store/userProfileSlice';
import { fetchUserDetails } from '../auth/userLoader';

interface UserDropdownProps{
    profile:userProfile | null;
    onProfileRefresh:() =>void;
}

export default function UserDropdown({profile,onProfileRefresh}:UserDropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = (): void => {
    console.log('User logged out');
      sendHTTPRequest(window.location.origin+'/logout',{method:'Get'}).then(res =>{
         if(res.ok){
           window.location.href='/UI/login';
         }
       });
  };

  const enablePushNotification = async () =>{

    const response = await sendHTTPRequest(window.location.origin+'/userservice/enablePushNotification',
      {method:'POST',
      body: String(profile?.pushNotification===0?1:0)
    });
    if(response.ok){
        console.log(response.status);
      if(response.status===200){
        alert('Push notifiaction changed');
        onProfileRefresh();
      }

    }
  }

  useEffect(() =>{

    fetchUserDetails();
  },[profile])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="user-icon-button user-icon"
      >
       <i className="fa-regular fa-user"></i>
      </button>
      {open && (
        <Portal >
        <div ref={menuRef} className="dropdown-panel">
          <div className="user-info">
            <div className="">First name : {profile?.firstName}</div>
            <div className="">Last Name : {profile?.lastName}</div>
            <div className="">Roles : {profile?.roles}</div>
            <div >Push Notification <Switch checked={profile?.pushNotification===1} onChange={enablePushNotification} /> </div>
          </div>
          <hr />
          <div className="logout-section">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        </Portal>
      )}
    </div>
    
  );
}
