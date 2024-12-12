import { Loader } from "@mantine/core";

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader color="#002554" />
        </div>
    );
};

export default LoadingSpinner;
