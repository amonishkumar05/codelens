import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import GradientHeader from "@/components/GradientHeader";
import Pixelate from "@/components/Pixelate";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <GradientHeader />
      <div className="h-full w-full flex items-center justify-center mt-64">
        <div className="text-center items-center flex justify-center flex-col">
          <Pixelate className="text-8xl font-bold mb-4">404</Pixelate>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
         <a href="/" className="text-black px-7 py-3 hover:px-9 block w-fit transition-all duration-150 rounded-full mt-8 font-semibold bg-[#8872df]"><Pixelate className="">Return</Pixelate></a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
