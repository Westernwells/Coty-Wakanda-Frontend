const BoxIcon = ({ fill = "white" }: { fill?: string }) => {
    return (
        <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3 17.9173V7.6971C3 7.45999 3.13964 7.24512 3.35632 7.14882L11.7563 3.41548C11.9115 3.34653 12.0885 3.34653 12.2437 3.41548L20.6437 7.14882C20.8604 7.24512 21 7.45999 21 7.6971V17.9173C21 18.1544 20.8604 18.3693 20.6437 18.4656L12.2437 22.1989C12.0885 22.2678 11.9115 22.2678 11.7563 22.1989L3.35632 18.4656C3.13964 18.3693 3 18.1544 3 17.9173Z"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.5 5.30713L16.1437 9.14877C16.3604 9.24507 16.5 9.45994 16.5 9.69705V13.3071"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default BoxIcon;
