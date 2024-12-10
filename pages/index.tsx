'use client';
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { Card, CardBody, CardFooter } from "@nextui-org/card";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon, Logo } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

import { Button, ButtonGroup } from "@nextui-org/button";
import { useState, useEffect } from "react";

import {Input,Avatar} from "@nextui-org/react"


import { Image } from "@nextui-org/image";
import { IoIosArrowForward } from "react-icons/io";
import { TbTransferVertical } from "react-icons/tb";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Display } from "next/dist/compiled/@next/font";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import {addressBooks , userStakeSol} from "@/core/action"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";


export default function IndexPage() {

  const [data, setData] = useState([
    {
      name:"Borrow",
      color:"success",
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


  const [repayData, setRepayData] = useState([
    {
      name: "Rastapepe",
      picture: "https://ipfs.io/ipfs/QmQeSMMH2icVbm3rumZnC21z6YdzD3axJYZ47QpYLcrWPi",
      amount: "2 SOL ",
      amountToken: "1000000",
    },
    {
      name: "PS1",
      picture: "https://ipfs.io/ipfs/QmZXbptRrJTPGGeh7N19DfUbddggYG5CghnJhXvp4rp4uf",
      amount: "0.2 SOL ",
      amountToken: "31326",
    },
    {
      name: "11Doge",
      picture: "https://ipfs.io/ipfs/QmUuBn5rN8SuC1E6UWrJwcHHvRP62tpPokqRVTPXHEisEC",
      amount: "1.4 SOL ",
      amountToken: "100610000",
    },
    {
      name: "0.047 ROS",
      picture: "https://ipfs.io/ipfs/QmdbbxHmRdFYnEscy5aEXYw3v46Pb7N6nPtXYJZnk3pgRG",
      amount: "1.8 SOL ",
      amountToken: "624234234",
    },

  ]);

  const [selectedFunction, setSelectedFunction] = useState([
    "Borrow",
    "Repay",
    "Long"
  ]);



  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  const { isOpen: isSupplyOpen, onOpen: onSupplyOpen, onClose: onSupplyClose } = useDisclosure();
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();


  useEffect(() => {
    //Window size function
        const handleResize = () => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
          });
        };
      handleResize();
      window.addEventListener('resize', handleResize);

      //Onload functions
      const onload = async () => {

      };

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    onload().catch(console.error);
  }, []);

  const { publicKey ,signTransaction } = useWallet();
  const connectWalletTest =  async () =>
  {
    
    console.log(
      publicKey
    )

    if(publicKey && signTransaction)
    {
      console.log("already connect ::",publicKey.toBase58())

      const addbook = addressBooks(publicKey)
      if(addbook)
      {
        console.log(
          addbook.systemConfig.toBase58(),
          addbook.poolStakingData.toBase58(),
          addbook.userStakingData.toBase58(),
          addbook.userBorrowData.toBase58(),
          addbook.userTokenAccount.toBase58(),
          addbook.poolTokenAuthority.toBase58(),
          addbook.poolTokenAccount.toBase58(),

        )

        await userStakeSol(publicKey,signTransaction);
      }

    }else{

    }
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Deposite&nbsp;</span>
          <span className={title({ color: "green" })+" github"}>Memecoin&nbsp;</span>
          {/* <span className={title({ color: "green" })}>Memecoin&nbsp;</span> */}
          {/* <br />
          <span className={title()}>
            Release SOL 
          </span> */}
        </div>
      <br></br>
      
      <div className="maincard">
      <Card className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full" style={{ width:"100%" }}>
  <CardBody className="py-5 gap-4">
    <div className="flex gap-2.5 justify-center">
      <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
        <span className="text-default-900 text-xl font-semibold">
          Stake Sol
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-6 w-full" style={{minWidth : windowSize.width*0.3}}>
      <div  style={{width:'100%' , display:"flex" , justifyContent:"space-between" }}>
        <Image
                alt="chain logo"
                height={40}
                src="/icon/sol.png"
                width={40}
        />

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Your Supply</span>
                      <span className="text-success text-xs">321</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Total Supply</span>
                      <span className="text-success text-xs">321</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Total Borrow</span>
                      <span className="text-success text-xs">321</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Supply APY</span>
                      <span className="text-success text-xs">321</span>
        </div>
        <Button  color="success" onClick={onSupplyOpen}>
          ➕ Supply
        </Button>
        <Button  color="danger" onClick={onWithdrawOpen}>
          ➖ Withdraw
        </Button>
      </div>
    </div>


  </CardBody>
</Card>
      </div>

      <br></br>
      <div className="maincard" style={{minWidth : windowSize.width*0.32}}>
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
                  tmp[index].color = "success";
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
          <p className="text-sm">SOL</p>
          <p>Receive</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              alt="chain logo"
              height={40}
              src="/icon/sol.png"
              width={40}
            />
            <div className="font-semibold text-white">
              <p>SOL</p>
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
        <Button className="w-full colorfulbuttons" color="success" onClick={connectWalletTest}>
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
        <Card className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full  justify-center" style={{ width:"100%"}}>
            <CardBody className="py-5 gap-4">
              <div className="flex gap-2.5 justify-center">
                <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                  <span className="text-default-900 text-xl font-semibold">
                    Repay Sol
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6  justify-center ">
              {repayData.map((item) => (
                <div key={item.name} className="grid grid-cols-4 w-full">
                  <div className="w-full">
                    <Avatar
                      isBordered
                      color="secondary"
                      src={item.picture}
                    />
                  </div>

                  <span className="text-default-900  font-semibold">
                    ${item.name}
                  </span>
                  <div>
                    
                    <div style={{display:"flex",flexDirection:"column"}}>
                      <span className="text-success text-xs">{item.amount}</span>
                      <span className="text-success text-xs">{item.amountToken}</span>
                    </div>
                  </div>
                  <div>
                  <Button color="danger">Close</Button>
                    {/* <span className="text-default-500 text-xs">{item.date}</span> */}
                  </div>
                </div>
              ))}
              </div>


            </CardBody>
        </Card> : null

}
      </div>


      <div>
        {/* All the models */}


      {/* Supply Modal */}
      <Modal isOpen={isSupplyOpen} onClose={onSupplyClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Supply SOL</ModalHeader>
          <ModalBody>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Image alt="chain logo" height={40} src="/icon/sol.png" width={40} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Your Supply</span>
                <span className="text-success text-xs">321</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Supply APY</span>
                <span className="text-success text-xs">321</span>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Input key="payinput" description="Withdraw anytime" label="Sol" labelPlacement="inside" placeholder="Enter sol amount to deposit" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={onSupplyClose} style={{ width: '100%' }}>
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Withdraw SOL</ModalHeader>
          <ModalBody>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Image alt="chain logo" height={40} src="/icon/sol.png" width={40} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Your Supply</span>
                <span className="text-success text-xs">321</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Supply APY</span>
                <span className="text-success text-xs">321</span>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Input key="payinput" description="Including all rewards" label="Sol" labelPlacement="inside" placeholder="Enter sol amount to withdraw" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={onWithdrawClose} style={{ width: '100%' }}>
              Withdraw
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
      </section>
    </DefaultLayout>
  );
}
