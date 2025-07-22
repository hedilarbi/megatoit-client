import OrderComponent from "@/components/OrderComponent";
import React from "react";

const page = async ({ params }) => {
  let { id } = await params;

  return (
    <div className=" bg-[#F8F8F8] w-screen pb-20 pt-8 ">
      <OrderComponent id={id} />
    </div>
  );
};

export default page;
