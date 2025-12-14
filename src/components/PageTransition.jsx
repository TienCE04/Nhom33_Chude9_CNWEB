import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-slide-in w-full h-full overflow-x-hidden"
    >
      {children}
    </div>
  );
};

export default PageTransition;
