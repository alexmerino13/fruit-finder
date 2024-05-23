"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useGeolocation } from "@uidotdev/usehooks";
import Map, { Marker, type MapRef } from "react-map-gl";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import {
  GlobeEuropeAfricaIcon,
  MapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import useNearbyFruits from "@/hooks/useNearbyFruits";
import useSpecificFruit from "@/hooks/useSpecificFruit";
import useLocationReviews from "@/hooks/useLocationReviews";
import "mapbox-gl/dist/mapbox-gl.css";
import { Fruit, FruitLocation } from "@/types";
import fruitIcon from "@/utils/fruitIcon";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import SideBar from "./SideBar";
import { toast } from "react-toastify";
import SearchBar from "./SearchBar";
import FruitFilter from "./FruitFilter";

export default function FruitMap({ token, reviewRequest }) {
  const initialState = isNaN(Number(reviewRequest.data)) ? false : true;
  const mapRef = useRef<MapRef>();
  const state = useGeolocation({ enableHighAccuracy: true });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { status } = useSession();
  const [fruits, setBounds, setFruitFilter] = useNearbyFruits();
  const [isStreet, setIsStreet] = useState(true);
  const [selectedFruit, setSelectedFruit] = useSpecificFruit(initialState ? Number(reviewRequest.data) : 1);
  const [selectedReviews, avgRating, reviewCount, setSelectedReviews] =
    useLocationReviews(initialState ? Number(reviewRequest.data) : 1);
  const [openPanel, setOpenPanel] = useState(initialState? true : false);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [followMe, setFollowMe] = useState(true);

  useEffect(() => {
    if (followMe) {
      mapRef.current?.setCenter([state.longitude, state.latitude]);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

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
    (document.getElementById("review_modal") as HTMLDialogElement).showModal();
  }

  const refreshReviewData = () => {
    setForceRefresh(!forceRefresh);
    setTimeout(() => {
      setSelectedReviews(selectedLocation, forceRefresh);
    }, 0);
  };

  const retrieveSearch = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let searchTxt = String(formData.get("searchText"));
    if (searchTxt != "") {
      const fetchSearch = async () => {
        const searchResponse = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${searchTxt}&types=place,country,region,city&access_token=${token}&session_token=${token}`
        );
        const searchData = await searchResponse.json();
        if (!searchResponse.ok) {
          toast.error("Error retreiving your search suggestions.");
        } else {
          if (searchData.suggestions.length > 0) {
            let suggestionId = searchData.suggestions[0].mapbox_id;
            const fetchSuggestion = async () => {
              const suggestionResponse = await fetch(
                `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestionId}?access_token=${token}&session_token=${token}`
              );
              const suggestionData = await suggestionResponse.json();
              if (!suggestionResponse.ok) {
                toast.error("Error retreiving your search location.");
              } else {
                if (suggestionData) {
                  let coords = suggestionData.features[0].properties.bbox;
                  mapRef.current?.fitBounds(coords);
                }
              }
            };
            fetchSuggestion();
          } else {
            toast.error("No locations found. Please try a new search.");
          }
        }
      };
      fetchSearch();
    }
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
          onZoomStart={() => setFollowMe(false)}
          onZoomEnd={updateBounds}
          onDragStart={() => {
            setOpenPanel(false);
            setFollowMe(false);
            setSelectedFruit(null);
          }}
        >
          <SearchBar onSearchSubmit={retrieveSearch} />
          <FruitFilter
            handleFilter={(fruit: Fruit) => {
              setFruitFilter(fruit.id === -1 ? undefined : fruit);
            }}
          />
          {fruits.map((fruitLocation: FruitLocation) => (
            <Fragment key={fruitLocation.id}>
              <Marker
                latitude={fruitLocation.latitude}
                longitude={fruitLocation.longitude}
                color="white"
              />
              <Marker
                latitude={fruitLocation.latitude}
                longitude={fruitLocation.longitude}
                offset={[0, -20]}
                // Unsure about this behavior. Could see user wanting to keep panel on screen as they navigate around
                onClick={() => {
                  setSelectedFruit(null);
                  setOpenPanel(false);
                  panelLoad(fruitLocation.id);
                }}
              >
                <span className="text-xl">
                  {fruitIcon(fruitLocation.fruit)}
                </span>
              </Marker>
            </Fragment>
          ))}
          <Marker longitude={state.longitude} latitude={state.latitude} />
        </Map>
      </div>

      <div className="navbar bg-white fixed bottom-0 z-10">
        <div className="navbar-start">
          {!followMe && (
            <button
              className="btn btn-sm"
              onClick={() => {
                mapRef.current?.flyTo({
                  center: [state.longitude, state.latitude],
                });
                setFollowMe(true);
              }}
            >
              <MapPinIcon className="h-6 w-6" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
        <div className="navbar-center">
          {status === "authenticated" ? (
            <button
              className="btn btn-primary"
              onClick={() => setAddModalOpen(true)}
            >
              <PlusCircleIcon className="h-6 w-6" />{" "}
              <span className="hidden md:inline">Add Fruit</span>
            </button>
          ) : (
            // TODO show log in button if user not logged in
            <></>
          )}
        </div>
        <div className="navbar-end">
          <div className="join">
            <button
              className={`btn btn-sm join-item ${isStreet ? "btn-active" : ""}`}
              onClick={() => setIsStreet(true)}
            >
              <MapIcon className="h-6 w-6" />
              <span className="hidden md:inline">Street</span>
            </button>
            <button
              className={`btn btn-sm join-item ${isStreet ? "" : "btn-active"}`}
              onClick={() => setIsStreet(false)}
            >
              <GlobeEuropeAfricaIcon className="h-6 w-6" />
              <span className="hidden md:inline">Satellite</span>
            </button>
          </div>
        </div>
      </div>
      <SideBar
        openPanel={openPanel && selectedFruit}
        setOpenPanel={setOpenPanel}
        selectedFruit={selectedFruit}
        selectedReviews={selectedReviews}
        avgRating={avgRating}
        reviewCount={reviewCount}
        refreshReviewData={refreshReviewData}
        reviewModal={reviewModal}
        selectedLocation={selectedLocation}
        setEditModalOpen={setEditModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
      />
      <div></div>

      {/* Conditionally render modal so state is reset each time opened */}
      {addModalOpen ? (
        <AddModal
          token={token}
          lat={state.latitude}
          lng={state.longitude}
          onAdd={() => {
            setAddModalOpen(false);
            updateBounds();
            // TODO notify user of successful add
          }}
          onClose={() => setAddModalOpen(false)}
        />
      ) : (
        <></>
      )}

      {editModalOpen ? (
        <EditModal
          token={token}
          tree={selectedFruit}
          onEdit={() => {
            setEditModalOpen(false);
            updateBounds();
            setOpenPanel(false);
            setSelectedFruit(null);
            // TODO notify user of successful edit
          }}
          onClose={() => setEditModalOpen(false)}
        />
      ) : (
        <></>
      )}

      {deleteModalOpen ? (
        <DeleteModal
          tree={selectedFruit}
          onDelete={() => {
            setDeleteModalOpen(false);
            updateBounds();
            setOpenPanel(false);
            setSelectedFruit(null);
            // TODO notify user of successful delete
          }}
          onClose={() => setDeleteModalOpen(false)}
        />
      ) : (
        <></>
      )}
    </>
  );
}
