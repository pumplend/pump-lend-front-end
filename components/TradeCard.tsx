import { Avatar } from "@nextui-org/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import {Input} from "@nextui-org/react"
export default function TradeCard() {
  return (
    <section className="cardwarp flex flex-col gap-2 p-4 bg-gray rounded-2xl" style={{color:"white"}}>
      <div className="card_head flex justify-between">
        <p>Dposite</p>
        <p className=" text-xs">
          <span>Balance: 0   </span>
          <button className="bg-green-500/50">MAX</button>
        </p>
      </div>
      <div className="card_body flex justify-between items-center text-white" >
        <div className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-green-500/50 hover:bg-black">
          <Avatar
            className="w-6 h-6 "
            src="https://pump.fun/logo.png"
          />
          <span className="text-medium ">PUMP</span>
          <RiArrowDropDownLine size={24} />
        </div>


        <input
        className=" text-2xl "
        style={{width:"30%"}}
        placeholder={"3915.5243788572"}
        >
          
        </input>
        {/* <div style={{width:"30%"}}  className="text-2xl">
        <Input 
                  onChange={
                    (e:any) => {  }
                  } 
                  key="payinput"   
                  placeholder={"3915.5243788572"}
                  />
        </div> */}

        {/* <p className=" text-2xl">3915.5243788572</p> */}
      </div>
      <div className="card_foot flex justify-between  text-xs">
        <p>PUMP COIN</p>
        {/* <p>
          <span>~$15 346 144 </span>
          <span>(-0.08%)</span>
        </p> */}
      </div>
    </section>
  );
}
