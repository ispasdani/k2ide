import React from "react";

interface LogoSvgProps {
  color?: string;
  className?: string;
}

const LogoSvg = ({ color, className }: LogoSvgProps) => {
  return (
    <svg
      width="100pt"
      height="100pt"
      version="1.1"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        transform="scale(4.1667)"
        d="m10.944 18.015c0 2.7534-2.2322 4.9847-4.9847 4.9847-2.7534 0-4.9847-2.2322-4.9847-4.9847m-0.001875 0c0-2.7534 2.2322-4.9847 4.9847-4.9847 2.7534 0 4.9847 2.2322 4.9847 4.9847m12.017-17-11.316 11.315"
        fill="none"
        stroke={color ? color : "#000"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
      <path
        transform="scale(4.1667)"
        d="m19 12-5.0559 5.0559m2.0559-16.056-9.0459 9.0459"
        fill="none"
        stroke={color ? color : "#000"}
        strokeDasharray="0 3 20"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
    </svg>
  );
};

export default LogoSvg;
