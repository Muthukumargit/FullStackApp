import './App.css'
import Header from './Common/Header/Header'
import { useAppSelector } from './Common/Store/hooks'
import TabsNav from './Common/Tabnav/TabsNav'
import React, { useEffect, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchUserDetails } from './Common/auth/userLoader';
import Loading from './Common/Loading/Loading'
interface AppProps{
  activeRoute:React.ReactElement
}

const App =({activeRoute}:AppProps) => {
 const user = useAppSelector((state)=>state.user);
 const userprofile = useAppSelector((state)=>state.profile);
 const [showloading,setShowloading] = useState(false);

 if(user.isAuthenticated){
 if(!userprofile.fetched)
 {
  // debugger;
  // console.log('fetching the user Details');
 fetchUserDetails();
 }
}
useEffect(() =>{
  // debugger;
  if(user.isAuthenticated){
    setShowloading(true);
    if(userprofile.fetched){
      setShowloading(false);
    }
  }
 

},[user,userprofile])

useEffect(() =>{

  },[])



 return (
    
    <>
    {showloading && <Loading message='Loading basic Details' show={true} />}
    {!showloading && <>
    <Header/>
    <TabsNav/>
    
<div className="landing-main-content">
  {React.cloneElement(activeRoute)}
</div>
</>
}
    </>
  )
}

export default App
