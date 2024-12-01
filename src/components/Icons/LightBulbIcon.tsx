const LightBulbIcon = ({ fill = "white" }: { fill?: string }) => {
    return (
        <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M21 2.80713L20 3.80713"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 2.80713L4 3.80713"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21 16.8071L20 15.8071"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 16.8071L4 15.8071"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 18.8071H15"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10 21.8071H14"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.9998 3.80713C7.9997 3.80713 5.95186 5.75742 5.99985 8.80713C6.02324 10.294 6.4997 11.3071 7.49985 12.3071C8.5 13.3071 9 13.8071 8.99985 15.8071H14.9998C15 13.8072 15.5 13.3071 16.4997 12.3072L16.4998 12.3071C17.4997 11.3071 17.9765 10.294 17.9998 8.80713C18.0478 5.75742 16 3.80713 11.9998 3.80713Z"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default LightBulbIcon;
