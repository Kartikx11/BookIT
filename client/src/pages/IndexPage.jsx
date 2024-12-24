import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("/places").then((response) => {
      setPlaces([...response.data, ...response.data]);
    });
  }, []);

  return (
    <div className=" mt-8 gap-x-6 gap-y-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {places.length > 0 &&
        places.map((place) => (
          <Link to={"/place/" + place._id}>
            <div
              className="bg-gray-100 mb-2 rounded-2xl flex flex-col items-center"
              key={place._id}
            >
              {place.photos?.[0] && (
                <img
                  className="rounded-2xl object-cover aspect-square"
                  src={`http://localhost:4000/uploads/${place.photos[0]}`}
                  alt={place.title}
                />
              )}
            </div>
            <h2 className="font-bold ">{place.address}</h2>
            <h3 className="text-center text-gray-500 text-black mt-2 text-sm">
              {place.title}
            </h3>
            <div className="mt-1">
              <span className="font-bold">${place.price}</span> per night
            </div>
          </Link>
        ))}
    </div>
  );
}