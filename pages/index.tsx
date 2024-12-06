import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { Card, CardBody, CardFooter } from "@nextui-org/card";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

import { Button, ButtonGroup } from "@nextui-org/button";
import { useState, useEffect } from "react";

import {Input} from "@nextui-org/input"


import { Image } from "@nextui-org/image";
import { IoIosArrowForward } from "react-icons/io";
import { TbTransferVertical } from "react-icons/tb";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Display } from "next/dist/compiled/@next/font";

export default function IndexPage() {

  const [data, setData] = useState([
    {
      name:"Borrow",
      color:"primary",
      display:true
    },
    {
      name:"Repay",
      color:"default",
      display:false
    },
    {
      name:"Long",
      color:"default",
      display:false
    },
  ]);

  const [selectedFunction, setSelectedFunction] = useState([
    "Borrow",
    "Repay",
    "Long"
  ]);
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Deposite&nbsp;</span>
          <span className={title({ color: "violet" })}>Memecoin&nbsp;</span>
          <br />
          <span className={title()}>
            Release SOL 
          </span>
        </div>
      
      <div className="maincard">
        <div style={{width:"100%",minWidth:"300px"}} className="inline-block max-w-xl text-center justify-center">
          <ButtonGroup>
            {data.map((item:any, index:any) => (
              <Button key={index} color={item.color}
                onClick={() => {
                  let tmp = JSON.parse(
                    JSON.stringify(
                      data
                    )
                  )

                  for(let i = 0 ; i < tmp.length ; i++)
                  {
                    tmp[i].color = "default";
                    tmp[i].display = false;
                  }
                  tmp[index].color = "primary";
                  tmp[index].display = true
                  setData(tmp);
                }}
              >
                {item.name}
              </Button>
            ))}
          </ButtonGroup>
        </div>



{
  data[0].display ? 
  <Card className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full" style={{ width:"100%" }}>
  <CardBody className="py-5 gap-4">
    <div className="flex gap-2.5 justify-center">
      <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
        <span className="text-default-900 text-xl font-semibold">
          Borrow Sol
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-6 w-full">
        <div style={{width:"100%"}}>


        <div className="flex justify-between items-center text-gray-500">
          <p className="text-sm">USDT</p>
          <p>Send</p>
        </div>
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Image
              alt="chain logo"
              height={40}
              src="https://pump.fun/logo.png"
              width={40}
            />
            <div className="font-semibold">
              <p>Tether</p>
              <p>0</p>
            </div>
          </div>

          <IoIosArrowForward className="text-gray-500" />
          <p>0</p>
        </div>

        <div className="flex justify-center items-center text-gray-500">
          <TbTransferVertical />
          {/* <div className="mx-2 border rounded-md px-2 py-1 text-sm">
            1 USDT = 0.0000167 BTC
          </div> */}
        </div>

        <div className="flex justify-between items-center text-gray-500">
          <p className="text-sm">BTC</p>
          <p>Receive</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              alt="chain logo"
              height={40}
              src="https://pump.fun/logo.png"
              width={40}
            />
            <div className="font-semibold text-white">
              <p>Bitcoin</p>
              <p>0</p>
            </div>
          </div>

          <IoIosArrowForward className="text-gray-500" />
          <p className="text-gray-500">0</p>
        </div>

        <Tabs fullWidth radius="md">
          <Tab key="25" title="25%" />
          <Tab key="50" title="50%" />
          <Tab key="100" title="100%" />
        </Tabs>

        <div className="text-center text-gray-500 text-xs">
          Network fee: 0.0025 SOL
        </div>
        <div className="bottom-14 right-0 w-full p-4">
        <Button className="w-full" color="primary">
          Connect Wallet
        </Button>
        </div>
        </div>
    </div>


  </CardBody>
</Card> : null
}


{
  data[1].display ? 
        <Card className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full" style={{ width:"100%"}}>
            <CardBody className="py-5 gap-4">
              <div className="flex gap-2.5 justify-center">
                <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                  <span className="text-default-900 text-xl font-semibold">
                    Repay Sol
                  </span>
                </div>
              </div>

              {/* <div className="flex flex-col gap-6 w-full">
                  <div style={{width:"100%"}}>
                  <Input
                  placeholder="Amount to repay"
                  />
                  <div className="bottom-14 right-0 w-full p-4">
                  <Button className="w-full" color="primary">
                    Connect Wallet
                  </Button>
                  </div>
                  </div>
              </div> */}


            </CardBody>
        </Card> : null

}
      </div>
      </section>
    </DefaultLayout>
  );
}
