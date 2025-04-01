"use client";

import { CloudUpload, X } from "lucide-react";
import Image from "next/image";
import React, { ChangeEvent, useState } from "react";

const ImageUpload = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const imageUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(imageUrl);
    }
  };
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {!previewUrl ? (
          <div className="p-5 border border-dashed rounded-md shadow-md flex flex-col justify-center items-center">
            <CloudUpload className="h-10 w-10" />
            <p className="text-lg font-bold">Upload Image</p>
            <p className="text-gray-400 mt-3">
              Click to Select Wireframe Image
            </p>
            <div className="p-5 border border-dashed w-full flex items-center justify-center mt-5 rounded-md">
              <label htmlFor="imageSelect">
                <p className="p-2 bg-primary text-white rounded-md px-3 cursor-pointer hover:bg-gray-600">
                  Select Image
                </p>
              </label>
            </div>
            <input
              type="file"
              id="imageSelect"
              className="hidden"
              onChange={onImageSelect}
              multiple={false}
            />
          </div>
        ) : (
          <div className="p-4 border border-dashed">
            <Image
              src={previewUrl}
              alt="preview uploaded image"
              width={500}
              height={500}
              className="w-full h-[300px] object-contain"
            />
            <X
              className="flex justify-end w-full cursor-pointer mt-2"
              onClick={() => setPreviewUrl(null)}
            />
          </div>
        )}

        <div>User Input</div>
      </div>
    </div>
  );
};

export default ImageUpload;
