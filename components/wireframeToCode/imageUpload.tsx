import { CloudUpload } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const ImageUpload = () => {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-5 border border-dashed rounded-md shadow-md flex flex-col justify-center items-center">
          <CloudUpload className="h-10 w-10" />
          <p className="text-lg font-bold">Upload Image</p>
          <p className="text-gray-400 mt-3">Click to Select Wireframe Image</p>
          <div className="p-5 border border-dashed w-full flex items-center justify-center mt-1">
            <Button>Select Image</Button>
          </div>
        </div>
        <div>User Input</div>
      </div>
    </div>
  );
};

export default ImageUpload;
