import { addMonthsToDate, dateToLocalString } from "@/lib/utils";
import ChevronDownIcon from "../Icons/ChevronDownIcon";

const DateChanger = ({date, setDate}: {date: Date, setDate: React.Dispatch<React.SetStateAction<Date>>}) => {
  const endDate = addMonthsToDate(date, 5)
  const changeDates = (operation: "add" | "sub") => {
    if (operation === "add") {
      setDate(addMonthsToDate(date, 6))
    } else {
      setDate(addMonthsToDate(date, -6))
    }
  };
  return (
    <div className="flex justify-center items-center">
      <button
        className="text-primary text-sm font-medium flex items-center gap-2 cursor-pointer"
        onClick={() => changeDates("sub")}
      >
        <span className="transform rotate-90">
          <ChevronDownIcon />
        </span>
      </button>
      <div className="text-primary text-sm font-medium  border-none size-10 flex items-center justify-around gap-4 w-max">
        <p>
          {dateToLocalString(date)}
        </p>
        <p>-</p>
        <p>
          {dateToLocalString(endDate)}
        </p>
      </div>
      <button
        className="text-primary text-sm font-medium flex items-center gap-2 cursor-pointer"
        onClick={() => changeDates("add")}
      >
        <span className="transform -rotate-90">
          <ChevronDownIcon />
        </span>
      </button>
    </div>
  );
};

export default DateChanger;
