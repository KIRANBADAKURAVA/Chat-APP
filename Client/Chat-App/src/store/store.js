import { configureStore } from "@reduxjs/toolkit";
import authSlice from './authSilce.js'

const Store = configureStore({
    reducer: {
       auth: authSlice
    }
}
)
export default Store