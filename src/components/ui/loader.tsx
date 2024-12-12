import React from "react";
import "@/assets/styles/loader.css";
const Loader = () => {
  return (
    /* From Uiverse.io by Nawsome */
    <div className="flex items-center justify-center w-[900px] h-[600px]">
    <section className="loader">
      <div className="slider" style={{ "--i": 0 } as React.CSSProperties}></div>
      <div className="slider" style={{ "--i": 1 } as React.CSSProperties}></div>
      <div className="slider" style={{ "--i": 2 } as React.CSSProperties}></div>
      <div className="slider" style={{ "--i": 3 } as React.CSSProperties}></div>
      <div className="slider" style={{ "--i": 4 } as React.CSSProperties}></div>
    </section></div>
  );
};

export default Loader;
