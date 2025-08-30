import React, { useRef, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useUser, useAuth, SignIn, SignUp } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'

import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Layout from './pages/Layout'
import Notification from './Components/Notification'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessage } from './features/messages/messagesSlice'

const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)
  const dispatch = useDispatch()

  console.log("Clerk Key:", import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
  console.log("Base URL:", import.meta.env.VITE_BASEURL)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()
  }, [user, getToken, dispatch])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id)
      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (pathnameRef.current === ('/messages/' + message.from_user_id._id)) {
          dispatch(addMessage(message))
        } else {
          toast.custom((t) => (
            <Notification t={t} message={message} />
          ), { position: "bottom-right" })
        }
      }
      return () => {
        eventSource.close()
      }
    }
  }, [user, dispatch])

  return (
    <>
      <Toaster />
      <Routes>
        {/* Clerk Auth pages */}
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

        {/* App pages */}
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
