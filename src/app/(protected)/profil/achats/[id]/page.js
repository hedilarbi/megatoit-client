import OrderComponent from "@/components/OrderComponent";
import React from "react";

const page = async ({ params, searchParams }) => {
  let { id } = await params;
  // ?gratuit=1 shows the order's free tickets (next home match) only
  const { gratuit } = await searchParams;

  return (
    <div className=" bg-[#F8F8F8] w-screen pb-20 pt-8 ">
      <OrderComponent id={id} freeTicketsOnly={gratuit === "1"} />
    </div>
  );
};

export default page;
