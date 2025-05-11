import React from "react";

type CollapseIconProps = React.SVGProps<SVGSVGElement>;

const CollapseIcon: React.FC<CollapseIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    {...props}
  >
    <path
      d="M1 10.5C1 6.02166 1 3.78249 2.39124 2.39124C3.78249 1 6.02166 1 10.5 1C14.9783 1 17.2175 1 18.6088 2.39124C20 3.78249 20 6.02166 20 10.5C20 14.9783 20 17.2175 18.6088 18.6088C17.2175 20 14.9783 20 10.5 20C6.02166 20 3.78249 20 2.39124 18.6088C1 17.2175 1 14.9783 1 10.5Z"
      stroke={props.stroke || "currentColor"}
      strokeWidth="1.5"
    />
    <path
      d="M11.0192 13.0051C10.4845 12.4782 8.49749 11.1993 8.5025 10.4539C8.5777 9.7155 10.4912 8.525 10.9924 8.00145M15.5014 10.492L8.5084 10.5295M5.47656 6.53076L5.5194 14.5227"
      stroke={props.stroke || "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CollapseIcon;
