import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Layout from './Layout.jsx'
import LeetCode from "./components/LeetCode/LeetCode.jsx"
import GitHub from "./components/Github/Github.jsx"
import Codeforces from "./components/Codeforces/Codeforces.jsx"
import Codechef from './components/Codechef/Codechef.jsx'
import { UsernameProvider } from './Username.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path='/' element={<Layout />}>
      <Route path='leetcode/:username' element={<LeetCode />} />
      <Route path='github/:username' element={<GitHub />} />
      <Route path='codeforces/:username' element={<Codeforces />} />
      <Route path='codechef/:username' element={<Codechef />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UsernameProvider>
    <RouterProvider router = {router}/>
    </UsernameProvider>
  </StrictMode>
)
