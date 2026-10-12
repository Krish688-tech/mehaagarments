import React from "react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (

      <div className="h-screen  bg-[#f8f5f0] flex justify-center items-center px-4 overflow-hidden">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

        {/* Brand */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-semibold tracking-wide text-[#3b2f2f]">
            Mehaa
          </h1>

          <p className="text-sm text-gray-500 mt-2 tracking-[3px] uppercase">
            Premium Sarees
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {title}
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;