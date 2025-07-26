import './MessageImproved.css';
import { useAppSelector } from '../Store/hooks';
import { useEffect, useRef, useState } from 'react';
import { Badge, Box, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FilledInput, FormControl, IconButton, InputAdornment, Portal, Typography } from '@mui/material';
import sendHTTPRequest from '../Utils/HttpWrappers';
import notificationosund from '../../assets/audio/bell-notification-337658.mp3'
import dayjs from 'dayjs';
import SendIcon from '@mui/icons-material/Send';


const Message = () => {

    const userProfile=useAppSelector(state => state.profile);
    const ws = useRef<WebSocket | null>(null);
    const [openchat,setOpenChat] = useState(false);
    const [userList,setUserList] = useState<any[]>([]);
    const [chatWindow,setChatWindow] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [messgetouser,setMessageToUser]= useState('');
    const [unreadmessage,setUnReadMessage]= useState(0);
    const [unreadCounts, setUnreadCounts] = useState<{ [userId: string]: number }>({});
    const messageIconRef = useRef<HTMLButtonElement>(null);
    const messageBodyRef=useRef<HTMLDivElement>(null);
    
    const [chathistory,setChatHistory] = useState<any[]>([{
    ID: 0,
    SENDER_ID: "",
    RECEIVER_ID: "",
    CONTENT: "",
    SENT_AT: "",
    SEEN: 0
}]);
 useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target as Node;
      if (
        messageIconRef.current &&
        !messageIconRef.current.contains(target) &&
        messageBodyRef.current &&
        !messageBodyRef.current.contains(target)
      ) {
        setOpenChat(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chathistory]);
  useEffect(() => {
    console.log(activeUsers.includes(messgetouser));
    console.log(activeUsers);
  if (chatWindow) {
    // Wait for the dialog to render
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }
}, [chatWindow]);

    useEffect(() =>{
        const protocol=window.location.protocol === 'https:' ? 'wss':'ws';
        ws.current=new WebSocket(`${protocol}://${window.location.host}/userservice/ws/messages?userId=${userProfile.profile?.userId}`);
        ws.current.onmessage= (event) =>{
            debugger;
            const data=JSON.parse(event.data);
            if(data.type=='onlineList'){
                console.log(data.users);
                setUserList(data.users);
            }else if(data.type=='chat'){
                console.log('chat details',data);
               
                 setUnreadCounts(prev => ({
            ...prev,
            [data.from]: (prev[data.from] || 0) + 1
        }));
                setUnReadMessage(prev => prev + 1);
                setChatHistory((prev: any[]) => [
                    ...prev,
                   {
                    ID:8,
                   SENDER_ID: data.from,
                    RECEIVER_ID: data.to,
                    CONTENT: data.content,
                    SENT_AT: "",
                    SEEN: 0
                   }
                ]);
            ringNotification();
            }
           
        };
        return () =>{
            ws.current?.close();
        };
    },[userProfile.fetched])
const ringNotification = () => {
    const audio = new Audio(notificationosund);
    audio.play().catch(err => console.warn('Audio play failed:', err));
};
    const sendmessage = () =>{

        console.log('sending message to ',messgetouser,' content ',message);
        ws.current?.send(JSON.stringify({
            type:'chat',
            from:userProfile.profile?.userId,
            to:messgetouser,
            content:message
        }));
          setChatHistory((prev: any[]) => [
                    ...prev,
                   {
                    ID:8,
                   SENDER_ID: userProfile.profile?.userId,
                    RECEIVER_ID: messgetouser,
                    CONTENT: message,
                    SENT_AT: "",
                    SEEN: 0
                   }
                ]);
        setMessage('');
        
    }
    const resetBadge = (userId:string) =>{
        debugger;
        const readcount=unreadCounts[userId];
        unreadCounts[userId]=0;
        if(unreadmessage >0){
        setUnReadMessage(prev => (prev-readcount));
        }
        
        console.log(unreadmessage);
        console.log(unreadCounts);
    }
    const openchatwindow = async (touser: string) => {
        console.log('open window for ', touser);
        setMessageToUser(touser);
        debugger;
        console.log('active users',activeUsers);
        const userId = userProfile.profile?.userId ?? '';
        const response = await sendHTTPRequest(window.location.origin + `/userservice/chat?user1=${encodeURIComponent(userId)}&user2=${encodeURIComponent(touser)}`, {
            method: 'GET'
        });
        
        if(response.ok){
    const data = await response.json();
    console.log('chat history :: ', data);
    setChatHistory(data); // Set all at once
    setTimeout(() => setChatWindow(true), 0); // Open after DOM update
}
    }

const renderUserCard = (user: any) => (
  user.USER_ID !== userProfile.profile?.userId ? (
    <Card key={user.USER_ID} variant="outlined" sx={{ mb: 1, m: 1,cursor:"pointer" }} onClick={() => { openchatwindow(user.USER_ID); resetBadge(user.USER_ID); setOpenChat(false); }}>
      <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: user.ONLINE_STATUS === 1 ? "green" : "gray",
            }}
          />
          <Typography sx={user.ONLINE_STATUS === 1 ? { color: "forestgreen" } : undefined} variant="subtitle1" fontWeight="bold">
            
            {user.USER_ID} 
          </Typography>
          <Badge sx={{left:"5px",top:"-10px"}} badgeContent={unreadCounts[user.USER_ID]!=0?unreadCounts[user.USER_ID]:0} color="error" />
        </Box>

        <Box sx={{ textAlign: "right" }}>
          {user.ONLINE_STATUS === 1 ? (
            <Typography variant="body2" color="success">
              Active Now
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {getRelativeLastSeen(user.LAST_ACTIVE)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  ) : null
);
const getRelativeLastSeen = (timestamp: any) => {
  if (!timestamp) return "Last seen: Unknown";

  const raw = String(timestamp).trim();

  // Check if it's a valid number
  if (!/^\d+$/.test(raw)) return "Invalid timestamp";

  // Handle seconds (10 digits) or milliseconds (13 digits)
  const ts = raw.length === 10 ? Number(raw) * 1000 : Number(raw);

  const last = dayjs(ts);
  if (!last.isValid()) return "Invalid date";

  const now = dayjs();
  const diffMinutes = now.diff(last, "minute");
  const diffHours = now.diff(last, "hour");

  if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `Last seen ${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else {
    return `Last seen on ${last.format("MMM DD")} at ${last.format("HH:mm")}`;
  }
};

const activeUsers = userList.filter(user => user.ONLINE_STATUS === 1);
const inactiveUsers = userList.filter(user => user.ONLINE_STATUS !== 1);


  
  return (
    <>
    <div className='message-main'>
       
        <div> 
          
            <button ref={messageIconRef} className='message-icon' onClick={() => setOpenChat(!openchat)}>
                 <Badge badgeContent={unreadmessage} color='success' >
                <i className="fa-regular fa-comment-dots msg-icon"></i>
                </Badge>
            </button>
            {openchat && ( <Portal>

            <div ref={messageBodyRef} className='message-box'>
                {activeUsers &&  (<>
                        <Typography variant="subtitle2" sx={{ ml: 2, mt: 1, textAlign:"center", color: "green" }}>
                            Active users
                        </Typography>
                        {
                        activeUsers.length >1 ?
                        activeUsers.map(renderUserCard):
                        <Typography variant="subtitle2" sx={{ ml: 2, mt: 1, textAlign:"center", color: "gray" }}>
                            No Active Users at this time
                            <hr></hr>
                        </Typography>
                        }   
                    </>
                )}
                {inactiveUsers && (
                    <>
                        <Typography variant="subtitle2" sx={{ ml: 2, mt: 1, textAlign:"center", color: "gray" }}>
                            Inactive users
                        </Typography>
                        {inactiveUsers.map(renderUserCard)}
                    </>
                )}
                
                </div>
            </Portal>)}
           <Dialog open={chatWindow}
                           onClose={() =>setChatWindow(!chatWindow)}
                           aria-labelledby="modal-modal-title"
                           aria-describedby="modal-modal-description"
                           scroll={'paper'}
                           className='dialog'
                           fullWidth
                           maxWidth='sm'
                       >
        <DialogTitle className='dialog-title1' id="scroll-dialog-title">
            
            <div className='chatHeader'>
                <Box
            sx={activeUsers.some(u => u.USER_ID ===messgetouser) ?{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "green",
              
            }:
          {
            width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "gray",
          }}
          />{messgetouser}
            </div>
            
             </DialogTitle>
             <DialogContent dividers={true} className="chat-content">
  {chathistory.map((item, index) => {
    let timeDisplay = '';
    if (item.SENT_AT) {
      const sent = dayjs(item.SENT_AT);
      const now = dayjs();
      if (now.diff(sent, 'hour') >= 24) {
        timeDisplay = sent.format('MMM DD, hh:mm A');
      } else {
        timeDisplay = sent.format('hh:mm A');
      }
    }
    return (
      <div
        key={index}
        className={`chat-row ${item.SENDER_ID === userProfile.profile?.userId ? 'from-user' : 'to-user'}`}
      >
        {item.SENDER_ID === userProfile.profile?.userId ? (
          <div className="chat-bubble from-bubble">
            <Typography className="chat-text">{item.CONTENT}</Typography>
            <div className="chat-time">
              {timeDisplay}
            </div>
          </div>
        ) : (
          <div className="chat-bubble to-bubble">
            <Typography className="chat-text">{item.CONTENT}</Typography>
            <div className="chat-time">
              {timeDisplay}
            </div>
          </div>
        )}
      </div>
    );
  })}
  <div  
  />
  <div ref={chatEndRef} />
</DialogContent>
<DialogActions className="dialog-actions">
  <div>
     <FormControl sx={{ mb: 0,m:1, }} variant="filled">
          <FilledInput 
            id="filled-adornment-password"
            type='text'
            value={message}
            onChange={(e)=>{setMessage(e.target.value)}}
            endAdornment={
              <InputAdornment position="end">
                <IconButton  onClick={sendmessage}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
  </div>
</DialogActions>
                       </Dialog>
              
        </div>


    </div>
    
    </>
  )
}

export default Message