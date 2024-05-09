"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useGeolocation } from "@uidotdev/usehooks";
import Map, { Marker, type MapRef } from "react-map-gl";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import useNearbyFruits from "@/hooks/useNearbyFruits";
import useSpecificFruit from "@/hooks/useSpecificFruit";
import useLocationReviews from "@/hooks/useLocationReviews";
import "mapbox-gl/dist/mapbox-gl.css";
import { FruitLocation } from "@/types";
import fruitIcon from "@/utils/fruitIcon";
import AddModal from "./AddModal";
import SideBar from './SideBar';

export default function FruitMap({ token }) {
  const mapRef = useRef<MapRef>();
  const state = useGeolocation();
  const [modalOpen, setModalOpen] = useState(false);
  const { status } = useSession();
  const [fruits, setBounds] = useNearbyFruits();
  const [isStreet, setIsStreet] = useState(true);
  const [selectedFruit, setSelectedFruit] = useSpecificFruit();
  const [selectedReviews, avgRating, reviewCount, setSelectedReviews] = useLocationReviews();
  const [openPanel, setOpenPanel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);

  if (state.loading) {
    // TODO show spinner or loading indicator
    return <p>Loading... (you may need to enable permissions)</p>;
  }

  if (state.error) {
    return <p>Enable permissions to access your location data</p>;
  }

  const updateBounds = () => {
    const bounds = mapRef.current?.getBounds();
    setBounds(
      bounds?._ne.lat,
      bounds?._ne.lng,
      bounds?._sw.lng,
      bounds?._sw.lat
    );
  };

  const panelLoad = async (id: number) => {
    setSelectedFruit(id);
    setSelectedReviews(id, forceRefresh);
    setSelectedLocation(id);
    setOpenPanel(true);
  };

  function reviewModal() {
    (document.getElementById('review_modal') as HTMLDialogElement).showModal();
  };

  const refreshReviewData = () => {
    setForceRefresh(!forceRefresh);
    setTimeout(() => {
      setSelectedReviews(selectedLocation, forceRefresh);
    }, 0);
  };

  return (
    <>
      <div>
        <Map
          ref={mapRef}
          mapboxAccessToken={token}
          initialViewState={{
            longitude: state.longitude,
            latitude: state.latitude,
            zoom: 16,
          }}
          // TODO - make height fill view port:
          style={{ height: "88vh" }}
          mapStyle={
            isStreet
              ? "mapbox://styles/mapbox/streets-v12"
              : "mapbox://styles/mapbox/satellite-streets-v12"
          }
          onDragEnd={updateBounds}
          onLoad={updateBounds}
          onZoomEnd={updateBounds}
          onDragStart={() => {
            setOpenPanel(false);
          }}
        >
          {fruits.map((fruitLocation: FruitLocation) => (
            <>
              <Marker
                key={`${fruitLocation.id}-bg`}
                latitude={fruitLocation.latitude}
                longitude={fruitLocation.longitude}
                color="white"
              />
              <Marker
                key={fruitLocation.id} //TODO: this is causing a lot of Warning: Each child in a list should have a unique "key" prop. errors in the log
                latitude={fruitLocation.latitude}
                longitude={fruitLocation.longitude}
                offset={[0, -20]}
                // Unsure about this behavior. Could see user wanting to keep panel on screen as they navigate around
                onClick={() => {
                  setOpenPanel(false);
                  panelLoad(fruitLocation.id);
                }}
              >
                <span className="text-xl">
                  {fruitIcon(fruitLocation.fruit)}
                </span>
              </Marker>
            </>
          ))}
          <Marker longitude={state.longitude} latitude={state.latitude} />
        </Map>
      </div>

      <div className="navbar bg-white fixed bottom-0 z-10">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          {status === "authenticated" ? (
            <button
              className="btn btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <PlusCircleIcon className="h-6 w-6" /> Add Fruit
            </button>
          ) : (
            // TODO show log in button if user not logged in
            <></>
          )}
        </div>
        <div className="navbar-end">
          <button
            className={`btn btn-sm mr-2 ${isStreet ? "btn-active" : ""}`}
            onClick={() => setIsStreet(true)}
          >
            Street
          </button>
          <button
            className={`btn btn-sm ${isStreet ? "" : "btn-active"}`}
            onClick={() => setIsStreet(false)}
          >
            Satellite
          </button>
        </div>
      </div>
      <SideBar
        openPanel = {openPanel}
        setOpenPanel = {setOpenPanel}
        selectedFruit = {selectedFruit}
        selectedReviews = {selectedReviews}
        avgRating = {avgRating}
        reviewCount = {reviewCount}
        refreshReviewData = {refreshReviewData}
        reviewModal = {reviewModal}
        selectedLocation = {selectedLocation}
      />
      <div></div>

      {/* Conditionally render modal so state is reset each time opened */}
      {modalOpen ? (
        <AddModal
          token={token}
          lat={state.latitude}
          lng={state.longitude}
          onAdd={() => {
            setModalOpen(false);
            updateBounds();
            // TODO notify user of successful add
          }}
          onClose={() => setModalOpen(false)}
        />
      ) : (
        <></>
      )}
    </>
  );
}
