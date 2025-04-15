import React from 'react'
import App from './App'
import { Outlet } from 'react-router-dom'
function Layout() {
  return (
    <>
    <App/>
    <Outlet/>
    </>
  )
}

export default Layout