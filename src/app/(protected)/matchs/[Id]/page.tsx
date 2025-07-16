import MatchContent from "@/components/MatchContent";
import React from "react";

const page = async ({ params }) => {
  let { Id } = await params;

  return (
    <div className=" bg-[#F8F8F8] w-screen pb-20 ">
      <MatchContent id={Id} />
    </div>
  );
};

export default page;
