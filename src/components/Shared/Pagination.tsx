import { Pagination } from "@mantine/core";
import ChevronDownIcon from "../Icons/ChevronDownIcon";

const PaginationComponent = ({ totalPages, activePage, setActivePage }: { totalPages: number, activePage: number, setActivePage: React.Dispatch<React.SetStateAction<number>> }) => {
  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 w-full">
          <div className="hidden sm:block">
            <Pagination.Root
              total={totalPages}
              value={activePage}
              onChange={setActivePage}
              color="#00EBB2"
              radius="xl"
              siblings={1}
              boundaries={3}
              classNames={{
                root: "w-full flex justify-center items-center",
                control:
                  "text-primary text-sm font-medium data-[active=true]:bg-green  border-none size-10 ",
              }}
            >
              <Pagination.Previous
                className="w-auto pe-5"
                icon={() => {
                  return (
                    <div className="text-primary text-sm font-medium flex items-center gap-2">
                      <span className="transform rotate-90">
                        <ChevronDownIcon />
                      </span>
                      Previous
                    </div>
                  );
                }}
              />
              <Pagination.Items />
              <Pagination.Next
                className="w-auto ps-5"
                icon={() => {
                  return (
                    <div className="text-primary gap-2  text-sm font-medium flex items-center">
                      Next
                      <span className="transform -rotate-90">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  );
                }}
              />
            </Pagination.Root>
          </div>
          <div className="sm:hidden  w-full">
            <Pagination.Root
              total={totalPages}
              value={activePage}
              onChange={setActivePage}
              color="#00EBB2"
              radius="xl"
              siblings={1}
              boundaries={1}
              classNames={{
                root: "w-full flex justify-center ",
                control:
                  "text-primary text-sm font-medium data-[active=true]:bg-green  border-none",
              }}
            >
              <Pagination.Previous
                className="w-auto pe-5"
                icon={() => {
                  return (
                    <div className="text-primary text-sm font-medium flex items-center gap-2">
                      <span className="transform rotate-90">
                        <ChevronDownIcon />
                      </span>
                      Previous
                    </div>
                  );
                }}
              />
              <Pagination.Items />
              <Pagination.Next
                className="w-auto ps-5"
                icon={() => {
                  return (
                    <div className="text-primary gap-2  text-sm font-medium flex items-center">
                      Next
                      <span className="transform -rotate-90">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  );
                }}
              />
            </Pagination.Root>
          </div>
        </div>
      )}
    </>
  );
};

export default PaginationComponent;
