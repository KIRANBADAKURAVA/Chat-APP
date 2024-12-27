import {createSlice} from '@reduxjs/toolkit'

const initialState= {
    status: false,
    data: null
}
const authSlice= createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action)=>{
            state.status= true
            state.data= action.payload

        },
        logout: (state, action )=>{
            state.status= false
            state.data= null
        }
    }

})

export const {login, logout}= authSlice.actions

export default authSlice.reducer