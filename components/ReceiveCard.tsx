import { Avatar } from "@nextui-org/react";
import { RiArrowDropDownLine } from "react-icons/ri";
export default function ReceiveCard() {
  return (
    <section className="cardwarp flex flex-col gap-2 p-4 bg-gray rounded-2xl" style={{color:"white"}}>
      <div className="card_head flex justify-between">
        <p>Borrow</p>
      </div>
      <div className="card_body flex justify-between items-center text-white" >
        <div className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-blue-500/50 hover:bg-black" style={{width:"30%"}}>
          <Avatar
            className="w-6 h-6"
            src="/icon/sol.png"
          />
          <span className="text-medium ">SOL</span>
          
        </div>
        <p className=" text-2xl">3915.5243788572</p>
      </div>
      <div className="card_foot flex justify-between">
        <p>

        </p>
        <p>
          <span>$15 346 144 </span>
          {/* <span>(-0.08%)</span> */}
        </p>
      </div>
    </section>
  );
}
