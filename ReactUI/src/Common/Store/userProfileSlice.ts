import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


export interface userProfile{
    userId:string,
    firstName:string,
    lastName:string,
    lastLoggedIn:string,
    phone:number,
    pushNotification:number,
    roles:string,
}

interface profileState{
    profile:userProfile | null,
    fetched:boolean
}

const initialState:profileState ={
    profile:null,
    fetched:false
}

const profileSlice = createSlice({
    name:'profile',
    initialState,
    reducers:{
        setProfile(state,action:PayloadAction<userProfile>){
            state.profile=action.payload;
            state.fetched=true;
        },
    },
});

export const {setProfile} =profileSlice.actions;
export default profileSlice.reducer;