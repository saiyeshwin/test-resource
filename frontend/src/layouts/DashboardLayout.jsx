
import React, { useEffect } from 'react';

import { Outlet } from 'react-router-dom';

import { Toaster, toast } from 'react-hot-toast';

import { io } from 'socket.io-client';

import Sidebar from '../components/Sidebar';

import Navbar from '../components/Navbar';



// 1. Initialize the socket connection to your Node.js microservice

const socket = io('http://localhost:5000', {

  autoConnect: false // We will connect it manually when the component mounts

});



export default function DashboardLayout() {



  useEffect(() => {

    // 2. Open the connection when the user hits the dashboard

    socket.connect();



    socket.on('connect', () => {

      console.log('Connected to Real-time Notification Service:', socket.id);

    });



    // 3. Listen for your 5 specific microservice events

    socket.on('taskAssigned', (data) => {

      toast.success(data.message, { duration: 4000 });

    });



    socket.on('taskStatusUpdated', (data) => {

      toast.success(data.message, { duration: 4000 });

    });



    socket.on('managerFeedbackAdded', (data) => {

      toast(data.message, { icon: '💬', duration: 4000 });

    });



    socket.on('predictionGenerated', (data) => {

      // If the AI flags it as a high risk, show a red error toast

      if (data.status.toLowerCase().includes('risk')) {

        toast.error(data.message, { duration: 6000 });

      } else {

        toast.success(data.message, { duration: 4000 });

      }

    });



    socket.on('sprintDeadlineAlert', (data) => {

      toast.error(data.message, { duration: 6000, icon: '⚠️' });

    });



    // 4. Cleanup function: Disconnect and remove listeners to prevent memory leaks

    return () => {

      socket.off('taskAssigned');

      socket.off('taskStatusUpdated');

      socket.off('managerFeedbackAdded');

      socket.off('predictionGenerated');

      socket.off('sprintDeadlineAlert');

      socket.disconnect();

    };

  }, []);



  return (

    <div className="app-container">

      {/* 5. Add the Toaster component to render the popups on screen */}

      <Toaster position="top-right" reverseOrder={false} />



      <Sidebar />

      <div className="flex-1 min-h-screen flex flex-col">

        <Navbar />

        <main className="p-6 md:p-8 lg:p-10">

          <Outlet />

        </main>

      </div>

    </div>

  );

}

