import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {  createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import LoginPage from './Pages/Login/Login.tsx'
import Landing from './Pages/Landing/Landing.tsx'
import User from './Pages/User/User.tsx'
import {canAccessPage} from './Common/Utils/HttpWrappers'
import { Provider } from 'react-redux'
import { store } from './Common/Store/store.ts'
import Attendence from './Pages/Attendence/Attendence.tsx'
import Report from './Pages/Report/Report.tsx'
import AccessDenied from './Pages/AccessDenied/AccessDenied.tsx'
import Registeruser from './Pages/RegisterUser/RegisterUser.tsx'
import Loading from './Common/Loading/Loading.tsx'


const router = createBrowserRouter([
  {
      path: '/UI/',
      element: <App activeRoute={<Landing key={'landing'} />} />,
      loader: async () => canAccessPage('landing'),
      errorElement: <AccessDenied />,
      HydrateFallback: () =><Loading message='Loading authentication data...' show={true}/>
    },
    {
      path: '/UI/login',
      element: <App activeRoute={<LoginPage key={'login'} />} />,
      // loader: async () => canAccessPage('login'),
      // async lazy() {
      //         canAccessPage('login');
      // },
    },
    {
      path: '/UI/user',
      element: <App activeRoute={<User key={'users'} />} />,
      loader: async () => canAccessPage('users'),
      errorElement: <AccessDenied />
      //  async lazy() {
      //         canAccessPage('user');
      // },
    },
    {
      path: '/UI/attendence',
      element: <App activeRoute={<Attendence key={'attendence'} />} />,
      loader: async () => canAccessPage('attendence'),
      errorElement: <AccessDenied />
      //  async lazy() {
      //         canAccessPage('user');
      // },
    },
    {
      path: '/UI/report',
      element: <App activeRoute={<Report key={'report'} />} />,
      loader: async () => canAccessPage('report'),
      errorElement: <AccessDenied />
      //  async lazy() {
      //         canAccessPage('user');
      // },
    },
    {
      path:'/UI/register',
      element:<App activeRoute={<Registeruser key={'register'}/>} />,
    },
    {
    path: '*',
    element: <Navigate to="/UI/" replace />
  },
//   {
//   path: "*",
//   element: <Navigate to="/" replace />
// }
]
)

createRoot(document.getElementById('root')!).render(
  
  <Provider store={store} >

<RouterProvider router={router}/>

  </Provider>
   

)
