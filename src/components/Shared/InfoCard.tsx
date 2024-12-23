const InfoCard = ({ title, data }: { title: string; data: string }) => {
  return <div className="bg-[#f2f4f6] p-4 text-primary capitalize" >
    <p className="text-sm text-black">{title}</p>
    <p className="sm:text-2xl text-lg font-bold">{data}</p>
  </div>;
};

export default InfoCard;
