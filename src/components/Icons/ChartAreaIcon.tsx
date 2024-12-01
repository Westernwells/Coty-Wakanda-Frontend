const ChartAreaIcon = ({ fill = "white" }: { fill?: string }) => {
    return (
        <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_843_301)">
                <path
                    d="M4 19.8071L8 13.8071L12 15.8071L16 10.8071L20 14.8071V19.8071H4Z"
                    stroke={fill}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M4 12.8071L7 8.80713L11 10.8071L16 4.80713L20 8.80713"
                    stroke={fill}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_843_301">
                    <rect
                        width="24"
                        height="24"
                        fill={fill}
                        transform="translate(0 0.807129)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

export default ChartAreaIcon;
