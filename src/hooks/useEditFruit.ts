import { Fruit } from "@/types";
import { useState } from "react";
const AWS_BUCKET_NAME = "fruitfinder";
const AWS_REGION = "us-east-2";

// This is the hook return type
type EditFruitData = [
  (
    tree: number,
    fruit: Fruit,
    latitude: number,
    longitude: number,
    notes: string,
    file: File
  ) => void,
  boolean,
  boolean
];

export default function useEditFruit(): EditFruitData {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function editFruit(
    tree: number,
    fruit: Fruit,
    latitude: number,
    longitude: number,
    notes: string,
    file: File
  ): Promise<void> {
    setSaving(true);

    let s3_img_link = null;
    if (file) {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (response.ok) {
        const { url, fields } = await response.json();

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append("file", file);

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          s3_img_link = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fields.key}`;
        } else {
          console.error("S3 Upload Error:", uploadResponse);
        }
      } else {
        console.error("Failed to get pre-signed URL.");
      }
    }


    const data = {
      name: fruit.name,
      fruit_id: fruit.id,
      latitude,
      longitude,
      description: notes,
      s3_img_link,
    };
    try {
      const response = await fetch(`/api/fruit_locations?id=${tree}`, {
        method: "PUT", // Specify the HTTP method as PUT
        headers: {
          "Content-Type": "application/json", // Set the Content-Type header to indicate JSON data
        },
        body: JSON.stringify(data), // Stringify the JavaScript object into JSON format
      });

      if (!response.ok) throw new Error(response.statusText);
    } catch (e) {
      console.error(e);
      setError(true);
    }
    setSaving(false);
  }

  return [editFruit, saving, error];
}
