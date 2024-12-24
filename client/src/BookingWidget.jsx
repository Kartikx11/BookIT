import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    } else {
      console.warn("User context is not available.");
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  async function bookThisPlace() {
    if (!checkIn || !checkOut || !name || !phone || !place._id) {
      alert("Please fill in all required fields before booking.");
      return;
    }

    try {
      const response = await axios.post("/bookings", {
        checkIn,
        checkOut,
        numberOfGuests,
        name,
        phone,
        place: place._id,
        price: numberOfNights * place.price,
        userId: user?._id, // Ensure user._id is passed
      });
      const bookingId = response.data._id;
      setRedirect(`/account/bookings/${bookingId}`);
    } catch (error) {
      console.error(
        "Error creating booking:",
        error.response?.data || error.message
      );
      alert("Failed to create booking. Please try again.");
    }
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white-200 shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price : ${place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className=" py-3 px-4">
            <label>Check In :</label>
            <input
              value={checkIn}
              onChange={(ev) => setCheckIn(ev.target.value)}
              type="date"
            />
          </div>
          <div className=" py-3 px-4 border-l">
            <label>Check Out :</label>
            <input
              value={checkOut}
              onChange={(ev) => setCheckOut(ev.target.value)}
              type="date"
            />
          </div>
        </div>

        <div className=" py-3 px-4 border-t">
          <label>Number of Guests:</label>
          <input
            value={numberOfGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
            type="number"
          />
        </div>
        {numberOfNights > 0 && (
          <div className=" py-3 px-4 border-t">
            <label>Your Fullname :</label>
            <input
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              type="text"
            />
            <label>Phone number :</label>
            <input
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              type="tel"
            />
          </div>
        )}
      </div>
      <button onClick={bookThisPlace} className="primary mt-4">
        Book this Place
        {numberOfNights > 0 && <span> ${numberOfNights * place.price}</span>}
      </button>
    </div>
  );
}
