import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const { data } = await axios.get("/user-places"); // Fetch places from backend
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching places:", error.response?.data || error);
      }
    };

    fetchPlaces();
  }, []);

  return (
    <div>
      <AccountNav />
      <div className="text-center">
        <Link
          className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
          to={"/account/places/new"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add new place
        </Link>
        <div className="mt-4">
          {places.length > 0 ? (
            places.map((place) => (
              <Link
                to={"/account/places/" + place._id}
                key={place._id}
                className="flex bg-gray-200 p-4 mb-4 cursor-pointer rounded-lg shadow-md"
              >
                <div className=" flex w-48 h-32 bg-gray-300 rounded gap-4 grow shrink-0">
                  {place.photos && place.photos.length > 0 ? (
                    // <img
                    //   src={`http://localhost:4000/uploads/${place.photos[0]}`}
                    //   alt={place.title}
                    //   className="object-cover"
                    // />
                    <PlaceImg place={place}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="ml-4 grow-0 shrink">
                  <h2 className="text-xl font-semibold">{place.title}</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    {place.description}
                  </p>
                  <p className="text-sm text-gray-800 mt-1 text-center">
                    Perks:
                  </p>
                  <div className="text-sm text-gray-800 mt-1 flex flex-wrap gap-2 justify-center">
                    {place.perks && place.perks.length > 0 ? (
                      place.perks.map((perk, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 px-2 py-1 rounded"
                        >
                          {perk}
                        </span>
                      ))
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600">No places found. Add a new one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
