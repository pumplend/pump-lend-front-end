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

import {Input,Avatar,Spinner} from "@nextui-org/react"


import { Image } from "@nextui-org/image";
import { IoIosArrowForward } from "react-icons/io";
import { TbTransferVertical } from "react-icons/tb";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Display } from "next/dist/compiled/@next/font";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import {
  addressBooks , 
  userStakeSol , 
  userWithdrawSol , 
  userBorrowToken,
  userRepayToken
} from "@/core/action"

import {
  testSoalanData,
  solanaDataInit
} from "@/core/solanaData"

import {
  userTokens,
  userTokenInit,
  getTokenBalance
} from "@/core/tokens"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { PublicKey } from "@solana/web3.js";


export default function IndexPage() {
  const { publicKey,connected ,signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([
    {
      name:"💰 Borrow",
      color:"success",
      display:true
    },
    // {
    //   name:"Repay",
    //   color:"default",
    //   display:false
    // },
    {
      name:"📈 Long",
      color:"default",
      display:false
    },
  ]);
  const [stakeAmout, setStakeAmount] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [borrowAmount, setBorrowAmount] = useState(0)
  
  const [selectedToken, setSelectedToken] = useState("")

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

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  const [kWindowsSize, setKWindowsSize] = useState(0);


  const { isOpen: isSupplyOpen, onOpen: onSupplyOpen, onClose: onSupplyClose } = useDisclosure();
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
  const { isOpen: isLoadingOpen, onOpen: onLoadingOpen, onClose: onLoadingClose } = useDisclosure();

  
  useEffect(() => {
    //Window size function
   
        const handleResize = () => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
          });
          setKWindowsSize(window.innerWidth*0.3);
          if(window.innerWidth*0.3<400)
          {
            setKWindowsSize(window.innerWidth*0.8)
          }
        };
      handleResize();
      window.addEventListener('resize', handleResize);

      //Onload functions
      const onConnect = async (address:PublicKey) => {
        onLoadingOpen()
        await userTokenInit(address);
        console.log("🍺 All my token ::",userTokens)
        if(userTokens  &&userTokens.length>0)
        {
          let tmp = JSON.parse(
            JSON.stringify(userTokens)
          )
          setSelectedToken(tmp[0].address);
        }
        
        onLoadingClose()
      };

      if (connected && publicKey) {
        console.log(
          "🍺 Wallet connect status ::",publicKey,connected
        )
        onConnect(publicKey).catch(console.error);
      }
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    
  }, [connected,publicKey]);


  const connectWalletTest =  async () =>
  {
    
    console.log(
      publicKey
    )

    if(publicKey && signTransaction)
    {
      console.log("already connect ::",publicKey.toBase58())

      const addbook = addressBooks(publicKey,selectedToken)
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
        await userStakeSol(stakeAmout,publicKey,signTransaction);
      }

    }else{

    }
  }

  const userStakeButton = async ()=>
  {
    if(publicKey && signTransaction)
      {
        
        const addbook = addressBooks(publicKey,selectedToken)
        if(addbook)
        {
          await userStakeSol(stakeAmout,publicKey,signTransaction);
          // await testStake(stakeAmout,publicKey,signTransaction);
          
        }
        onSupplyClose();
      }else{
  
      }
  }

  const userWithdrawButton = async ()=>
    {
      if(publicKey && signTransaction)
        {
          const addbook = addressBooks(publicKey,selectedToken)
          if(addbook)
          {
            await userWithdrawSol(withdrawAmount,publicKey,signTransaction);
          }
          onWithdrawClose();
        }else{
    
        }
    }

  const userBorrowButton = async ()=>
    {
      if(publicKey && signTransaction)
        {
          const addbook = addressBooks(publicKey,selectedToken)
          if(addbook)
          {
            await userBorrowToken(borrowAmount,publicKey,signTransaction);
          }
        }else{
    
        }
    }

    const userRepayButton = async ()=>
      {
        if(publicKey && signTransaction)
          {
            const addbook = addressBooks(publicKey,selectedToken)
            if(addbook)
            {
              await userRepayToken(publicKey,signTransaction);
            }
          }else{
      
          }
      }

      const debugs = async () => 
      {
        
        if(publicKey)
        {
          const bk = solanaDataInit(publicKey,selectedToken);
          if(bk)
          {
            await testSoalanData(publicKey)
          }
        }
       

      }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Deposite&nbsp;</span>
          <span className={title({ color: "green" })+" github"}>Memecoin&nbsp;</span>
          <Button onClick={debugs}> Debug</Button>
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
                      <span className="text-success">321</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Total Supply</span>
                      <span className="text-success">321</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Total Borrow</span>
                      <span className="text-success">321</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Supply APY</span>
                      <span className="text-success">321</span>
        </div>

      </div>
      <div style={{width:'100%' , display:"flex" , justifyContent:"space-between" }}>
      <Button  color="success" onClick={onSupplyOpen} style={{width:"47%"}}>
          ➕ Supply
        </Button>
        <Button  color="danger" onClick={onWithdrawOpen} style={{width:"47%"}}>
          ➖ Withdraw
        </Button>
        </div>
    </div>


  </CardBody>
</Card>
      </div>

      <br></br>
      <div style={{width:"100%",minWidth:"300px"}} className="inline-block max-w-xl text-center justify-center item-center">
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
      <div className="maincard" style={{minWidth : windowSize.width*0.32}}>

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
          <p className="text-sm">USE COLLATERAL</p>
          {/* <p>Borrow</p> */}
        </div>
        <div className="flex justify-between items-center text-white" >
          <div className="flex items-center space-x-2" style={{width:"100%"}}>
            <Image
              alt="chain logo"
              height={40}
              src="https://pump.fun/logo.png"
              width={40}
            />
            <div className="font-semibold" >
              <p>Pump</p>
              <div style={{textSizeAdjust:"auto"}} >
               <p style={{background:"grey"}}> 50% </p> &nbsp;
               <p style={{background:"grey"}}> MAX </p>
              </div>
              
            </div>
          </div>

          {/* <IoIosArrowForward className="text-gray-500" /> */}
          {/* <p>0</p> */}
          <Input 
          onChange={
            (e:any) => { setBorrowAmount(e.currentTarget.value); }
          } 
          key="payinput" 
          // description="Withdraws anytime" 
          // label="amount" labelPlacement="inside" 
          placeholder="0"
          />
        </div>
        {/* <Tabs fullWidth radius="md">
          <Tab key="25" title="25%" />
          <Tab key="50" title="50%" />
          <Tab key="100" title="100%" />
        </Tabs> */}
        {/* <div className="flex justify-center items-center text-gray-500">
          <TbTransferVertical />
        </div> */}

          <br></br>
        <div className="flex justify-between items-center text-gray-500">
          <p className="text-sm">TO Borrow</p>
          {/* <p>Receive</p> */}
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

          {/* <IoIosArrowForward className="text-gray-500" /> */}
          <p className="text-gray-500">0</p>
        </div>



        <div className="text-center text-gray-500 text-xs">
          Network fee: 0.0025 SOL
        </div>
        <div className="bottom-14 right-0 w-full p-4">
        <Button className="w-full colorfulbuttons" color="success" onClick={userBorrowButton}>
          Borrow SOL
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
          Leverage Long
        </span>
      </div>
    </div>

<div style={{display:"flex-wrap"}}>

<iframe src="https://www.gmgn.cc/kline/sol/CHUxbA8Y674koHfBERgoir2UQxwLTpW11C7LUgoYpump" width={kWindowsSize + "px"} height={windowSize.height*0.4}></iframe>
<div>
&nbsp;
&nbsp;
&nbsp;
</div>
<div className="flex flex-col gap-6 w-full">
  <div style={{width:"100%"}}>
  </div>
        <div style={{width:"100%"}}>


        <div className="flex justify-between items-center text-gray-500">
          <p className="text-sm">USE COLLATERAL</p>
          {/* <p>Borrow</p> */}
        </div>
        <div className="flex justify-between items-center text-white" >
          <div className="flex items-center space-x-2" style={{width:"100%"}}>
            <Image
              alt="chain logo"
              height={40}
              src="https://pump.fun/logo.png"
              width={40}
            />
            <div className="font-semibold" >
              <p>Pump</p>
              <div style={{textSizeAdjust:"auto"}} >
               <p style={{background:"grey"}}> 50% </p> &nbsp;
               <p style={{background:"grey"}}> MAX </p>
              </div>
              
            </div>
          </div>

          {/* <IoIosArrowForward className="text-gray-500" /> */}
          {/* <p>0</p> */}
          <Input 
          onChange={
            (e:any) => { setBorrowAmount(e.currentTarget.value); }
          } 
          key="payinput" 
          // description="Withdraws anytime" 
          // label="amount" labelPlacement="inside" 
          placeholder="0"
          />
        </div>

          <br></br>
        <div className="flex justify-between items-center text-gray-500">
          <p className="text-sm">TO Borrow</p>
          {/* <p>Receive</p> */}
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

          {/* <IoIosArrowForward className="text-gray-500" /> */}
          <p className="text-gray-500">0</p>
        </div>



        <div className="text-center text-gray-500 text-xs">
          Network fee: 0.0025 SOL
        </div>
        <div className="bottom-14 right-0 w-full p-4">
        <Button className="w-full colorfulbuttons" color="success" onClick={userBorrowButton}>
          Buy
        </Button>
        </div>
        </div>
    </div>

</div>

  </CardBody>
        </Card> : null

}
      </div>

<br></br>


<div className="maincard" style={{minWidth : windowSize.width*0.32}}>
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
                  
                  <Button color="danger" onClick={userRepayButton}>Close</Button>
                  <Button color="success" onClick={userRepayButton}>Repay</Button>
                    {/* <span className="text-default-500 text-xs">{item.date}</span> */}
                  </div>
                </div>
              ))}
              </div>


            </CardBody>
</Card>
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
              <Input onChange={(e:any) => { setStakeAmount(e.currentTarget.value); }} key="payinput" description="Withdraw anytime" label="Sol" labelPlacement="inside" placeholder="Enter sol amount to deposit" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={userStakeButton} style={{ width: '100%' }}>
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
              <Input onChange={(e:any) => { setWithdrawAmount(e.currentTarget.value); }} key="payinput" description="Including all rewards" label="Sol" labelPlacement="inside" placeholder="Enter sol amount to withdraw" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={userWithdrawButton} style={{ width: '100%' }}>
              Withdraw
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

            {/* Loading Modal */}
        <Modal isOpen={isLoadingOpen} onClose={onLoadingClose} hideCloseButton={true} isDismissable={false} isKeyboardDismissDisabled={true}>
        <ModalContent>
         
          <ModalBody>
            <Spinner  style={{height:"300px"}} color="warning" label="Account Loading ..." />
          </ModalBody>
        </ModalContent>
      </Modal>
      </div>
      </section>
    </DefaultLayout>
  );
}
