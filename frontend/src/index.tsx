import React from "react";
import ReactDOM from "react-dom/client"; // Updated import for React 18
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { RoomProvider } from "./context/RoomContext";
import { Home } from "./pages/Home";
import { Room } from "./pages/Room";
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import { Join } from "./components/Join";

// Find the root element in the DOM
const container = document.getElementById("root");

if (container) {
  // Use ReactDOM.createRoot instead of ReactDOM.render
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <UserProvider>
          <RoomProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join" element={<Join />} />
              <Route
                path="/room/:id"
                element={
                  <ChatProvider>
                    <Room />
                  </ChatProvider>
                }
              />
            </Routes>
          </RoomProvider>
        </UserProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
