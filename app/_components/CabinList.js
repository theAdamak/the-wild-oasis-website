import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "../_lib/data-service";
// import { unstable_noStore as noStore } from "next/cache";

async function CabinList({ filter }) {
  // only this component will be dynamic
  // noStore();
  const cabins = await getCabins();

  if (cabins.length === 0) return null;

  let displayCabin;
  if (filter === "all") displayCabin = cabins;
  if (filter === "small") {
    displayCabin = cabins.filter((cabin) => cabin.maxCapacity <= 3);
  }
  if (filter === "medium") {
    displayCabin = cabins.filter(
      (cabin) => cabin.maxCapacity > 3 && cabin.maxCapacity < 8
    );
  }
  if (filter === "large") {
    displayCabin = cabins.filter((cabin) => cabin.maxCapacity >= 8);
  }

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
      {displayCabin.map((cabin) => (
        <CabinCard cabin={cabin} key={cabin.id} />
      ))}
    </div>
  );
}

export default CabinList;
