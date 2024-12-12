import React from "react";
import Loader from "@/components/ui/loader";


const LoadingState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader />
        </div>
    );
};

export default LoadingState;
