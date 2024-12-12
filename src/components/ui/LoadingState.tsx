import React from "react";
import Loader from "./loader";
interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Generating recommendations...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
