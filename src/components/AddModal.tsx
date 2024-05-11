import { useState } from "react";
import { ExclamationCircleIcon, CameraIcon } from "@heroicons/react/16/solid";
import fruitIcon from "@/utils/fruitIcon";
import AddMap from "./AddMap";
import useFruits from "@/hooks/useFruits";
import useAddFruit from "@/hooks/useAddFruit";
import { Fruit } from "@/types";

export default function AddModal({ token, lat, lng, onClose, onAdd }) {
  const [fruitType, setFruitType] = useState<Fruit>();
  const [latitude, setLatitude] = useState(lat);
  const [longitude, setLongitude] = useState(lng);
  const [fruits, loading] = useFruits();
  const [addFruit, saving, error] = useAddFruit();
  const [file, setFile] = useState<File | null>(null);

  async function saveFruit() {
    await addFruit(fruitType, latitude, longitude, file);
    onAdd();
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => onClose()}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Add Fruit</h3>
        {error ? (
          <div role="alert" className="alert alert-error mb-4">
            <ExclamationCircleIcon className="h-6 w-6" />
            <span>Error! Unable to add fruit.</span>
          </div>
        ) : (
          <></>
        )}

        <AddMap
          fruit={fruitType?.name}
          latitude={latitude}
          longitude={longitude}
          token={token}
          onClick={(lt, ln) => {
            setLatitude(lt);
            setLongitude(ln);
          }}
        />

        <select
          disabled={loading}
          className="select select-bordered select-lg w-full mt-3"
          value={fruitType?.id}
          onChange={(e) => {
            const fruit = fruits.find((f) => f.id == parseInt(e.target.value));
            setFruitType(fruit);
          }}
        >
          <option disabled selected>
            What type of fruit?
          </option>
          {fruits.map((fruit: Fruit) => (
            <option key={fruit.id} value={fruit.id}>
              {fruitIcon(fruit.name)} {fruit.name}
            </option>
          ))}
        </select>
        <div className="mt-3 flex justify-center">
          <input
            className="hidden"
            id="file"
            type="file"
            capture="environment"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                setFile(files[0]);
              }
            }}
            accept="image/*"
          />
          <button
            className="btn rounded-full btn-lg btn-primary px-4"
            onClick={() => {
              document.getElementById("file").click();
            }}
          >
            <CameraIcon className="w-8 h-8" />
            <span className="hidden md:inline">Add Photo</span>
          </button>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-primary"
            disabled={!fruitType || saving}
            onClick={() => {
              saveFruit();
            }}
          >
            {saving ? "Saving..." : "Add"}
          </button>
          <button className="btn btn-outline" onClick={() => onClose()}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
