import { createAsyncThunk } from "@reduxjs/toolkit";
import { setProfile } from "../Store/userProfileSlice";
import sendHTTPRequest from "../Utils/HttpWrappers";


export const fetchUserDetails = createAsyncThunk(
  'userProfile/fetchUserDetails',
  async (_, { dispatch }) => {
    const response = await sendHTTPRequest(window.location.origin + '/userservice/getProfile', { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      dispatch(setProfile(data));
      return data;
    }
    throw new Error('Failed to fetch user profile');
  }
);


    export async function updateLastLoggedin(){
const response = await sendHTTPRequest(window.location.origin+'/userservice/updateLastLoggedIn',{method:'GET'});

     if( response.ok){
        console.log('last logged in Updated !!!');
     }
    }
    