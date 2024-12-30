import {createSlice} from '@reduxjs/toolkit'

const initialState= {
    status: (localStorage.getItem("data")!==null && localStorage.getItem("data") !== "")? true: false,
    
    data: JSON.parse(localStorage.getItem("data")) || null,

}
const authSlice= createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action)=>{
            state.status= true
            state.data= action.payload
            localStorage.setItem("data", JSON.stringify(action.payload));
           

        },
        logout: (state, action )=>{
            state.status= false
            state.data= null
            localStorage.removeItem("data");
            localStorage.removeItem("accesstoken");
        }
    }

})

export const {login, logout}= authSlice.actions

export default authSlice.reducer