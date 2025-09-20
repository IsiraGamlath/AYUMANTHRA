import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
//import CartItem from "./components/CartItem/CartItem";
import AddCart from "./components/AddCart/AddCart";
import CartDetails from "./components/CartDetails/CartDetails";
import UpdateCart from "./components/UpdateCart/UpdateCart";
import "./App.css";
import DeliveryTrackingSystem from "./components/DeliveryTrackingSystem/DeliveryTrackingSystem";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <div>
        <React.Fragment>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mainhome" element={<Home />} />
            <Route path="/addcart" element={<AddCart />} />
            <Route path="/cartdetails" element={<CartDetails />} />
            <Route path="/cartdetails/:id" element={<UpdateCart />} />
            <Route path="/track" element={<DeliveryTrackingSystem />} />
          </Routes>
        </React.Fragment>
      </div>
    </NotificationProvider>
  );
}

export default App;
