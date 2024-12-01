const GroupIcon = ({ fill = "white" }: { fill?: string }) => {
    return (
        <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1 20.8071V19.8071C1 15.9411 4.13401 12.8071 8 12.8071C11.866 12.8071 15 15.9411 15 19.8071V20.8071"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M13 14.8071C13 12.0457 15.2386 9.80713 18 9.80713C20.7614 9.80713 23 12.0457 23 14.8071V15.3071"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M8 12.8071C10.2091 12.8071 12 11.0162 12 8.80713C12 6.59799 10.2091 4.80713 8 4.80713C5.79086 4.80713 4 6.59799 4 8.80713C4 11.0162 5.79086 12.8071 8 12.8071Z"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18 9.80713C19.6569 9.80713 21 8.46398 21 6.80713C21 5.15028 19.6569 3.80713 18 3.80713C16.3431 3.80713 15 5.15028 15 6.80713C15 8.46398 16.3431 9.80713 18 9.80713Z"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default GroupIcon;
