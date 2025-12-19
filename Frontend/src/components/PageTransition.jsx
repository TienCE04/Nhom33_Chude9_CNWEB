import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-slide-in w-full h-full"
    >
      {children}
    </div>
  );
};

export default PageTransition;
