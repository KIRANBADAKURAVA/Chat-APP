import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Store from './store/store.js';
import App from './App.jsx';
import { Login, Register, Chats, AllUsers, Profile, Home } from './index.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path:'/login',
        element:<Login/>
      },
      {
        path:'register',
        element: <Register/>
      },
      {
        path: 'all-chats',
        element: <Chats/>

      },
      {
        path: 'users',
        element: <AllUsers/>

      },
      {
        path: 'profile',
        element: <Profile/>
      }
    ]
},
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={Store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
