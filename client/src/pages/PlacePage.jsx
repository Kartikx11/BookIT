import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookingWidget from "../BookingWidget";

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false); // Manage show more/less photos state

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`/places/${id}`).then((response) => {
      setPlace(response.data);
    });
  }, [id]);

  if (!place) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.address
  )}`;

  return (
    <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
      <h1 className=" text-3xl">{place.title}</h1>
      <div className="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path
            fillRule="evenodd"
            d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            clipRule="evenodd"
          />
        </svg>

        <a
          target="_blank"
          href={googleMapsUrl}
          rel="noopener noreferrer"
          className="my-2 text-gray-700 hover:underline block font-semibold"
        >
          {place.address}
        </a>
      </div>

      <div className="relative">
        <div className="grid grid-cols-[70%_30%] grid-rows-[6fr_3fr_3fr] gap-4">
          {/* Large Image (left) */}
          <div className="row-span-3 bg-gray-200 rounded-lg overflow-hidden">
            {place.photos?.[0] && (
              <img
                onClick={() => setShowAllPhotos(true)}
                src={`http://localhost:4000/uploads/${place.photos[0]}`}
                alt="Photo 1"
                className="cursor-pointer w-full h-full object-cover"
              />
            )}
          </div>
          {/* Small Image 1 (right) */}
          <div className="bg-gray-200 rounded-lg overflow-hidden">
            {place.photos?.[1] && (
              <img
                onClick={() => setShowAllPhotos(true)}
                src={`http://localhost:4000/uploads/${place.photos[1]}`}
                alt="Photo 2"
                className="cursor-pointer w-full h-full object-cover"
              />
            )}
          </div>
          {/* Small Image 2 (right, below the first small image) */}
          <div className="row-span-2 bg-gray-200 rounded-lg overflow-hidden relative">
            {place.photos?.[2] && (
              <img
                onClick={() => setShowAllPhotos(true)}
                src={`http://localhost:4000/uploads/${place.photos[2]}`}
                alt="Photo 3"
                className="cursor-pointer w-full h-full object-cover"
              />
            )}
            {/* Show more/less Photos button positioned at the bottom-right of this image */}
            <button
              onClick={() => setShowAllPhotos(!showAllPhotos)} // Toggle the state
              className="flex gap-1 absolute bottom-2 right-2 py-2 px-2 text-black bg-white-500 bg-opacity-800 rounded-2xl shadow-md shadow-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                  clipRule="evenodd"
                />
              </svg>

              {showAllPhotos ? "Show less Photos" : "Show more Photos"}
            </button>
          </div>
        </div>

        {/* Show All Photos when showAllPhotos is true */}
        {showAllPhotos && (
          <div className="mt-4 bg-gray-200 p-4 rounded-lg">
            <h3>All Photos</h3>
            {/* Display all photos from the place */}
            {place.photos?.slice(3).map((photo, index) => (
              <img
                key={index}
                src={`http://localhost:4000/uploads/${photo}`}
                alt={`Additional photo ${index + 3}`}
                className=" w-full h-full object-cover mb-2"
              />
            ))}
          </div>
        )}
      </div>
      <div className=" mt-8 mb-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div>
          <div className="my-4">
            <h2 className="font-semibold text-2xl">Description</h2>
            {place.description}
          </div>
          Check In : {place.checkIn} <br />
          Check Out : {place.checkOut} <br />
          Max Number of guests : {place.maxGuests}
        </div>
        <div>
          <BookingWidget place={place} />
        </div>
      </div>
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Extra Info</h2>
        </div>
        <div className=" mb-4 mt-2 text-sm text-gray-700 leading-5">
          {place.extraInfo}
        </div>
      </div>
    </div>
  );
}
