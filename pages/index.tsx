'use client';
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { Card, CardBody, CardFooter } from "@nextui-org/card";

import { envConfig } from "@/config/env";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon, Logo } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

import { Button, ButtonGroup } from "@nextui-org/button";
import { useState, useEffect } from "react";

import {Input,Avatar,Spinner ,DropdownItem,DropdownMenu,DropdownTrigger,Dropdown,Tooltip , Tabs, Tab} from "@nextui-org/react"


import { Image } from "@nextui-org/image";
import { IoIosArrowForward } from "react-icons/io";
import { TbTransferVertical } from "react-icons/tb";
import { Display } from "next/dist/compiled/@next/font";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { FaArrowDown } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import { LuLockKeyhole } from "react-icons/lu";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { BiInfoCircle } from "react-icons/bi";
import { IoWalletOutline } from "react-icons/io5";
import TradeCard from "@/components/TradeCard";
import ReceiveCard from "@/components/ReceiveCard";

import { FaArrowLeft } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { Chip } from "@nextui-org/chip";

import {
  addressBooks , 
  userStakeSol , 
  userWithdrawSol , 
  userBorrowToken,
  userRepayToken,
  pumpBuyTest,
  pumpSellTest,
  userLeverageTokenPump,
  userCloseTokenPump
} from "@/core/action"

import {
  testSoalanData,
  solanaDataInit
} from "@/core/solanaData"

import {
  userTokens,
  userTokenInit,
  getTokenBalance,
  userBorrowTokens,
  userSolStakeFetch,
  userTokenBorrowFetch,
  getAddressBalance
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

// @ts-ignore
import BN from 'bn.js';
export default function IndexPage() {
  const { publicKey,connected ,signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([
    {
      name:"💰 Borrow",
      color:"success",
      display:true
    },
    {
      name:"📈 Long",
      color:"default",
      display:false
    },
  ]);
  const [stakeAmout, setStakeAmount] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [borrowAmount, setBorrowAmount] = useState(0)
  const [leverageAmount, setLeverageAmount] = useState(0)
  const [repayChartDisplay, setRepayChartDisplay] = useState(false)
  
  const [selectedToken, setSelectedToken] = useState("")
  const [selectedTokenInfo, setSelectedTokenInfo] = useState(
    {
      "address": "",
      "balance": 1000000,
      "associated_account": "",
      "info": {
          "decimals": 9,
          "name": "PUMP Coin",
          "symbol": "PUMP",
          "image": "",
          "metadata_uri": ""
      }
  }
  )

  const [userStakeSolInformation, setUserStakeSolInformation] = useState(
    {
      totalStaked:BigInt(0),
      totalShares:BigInt(0),
      totalBorrowed:BigInt(0),
      pendingVaultProfit:BigInt(0),
      userShares:BigInt(0),
    }
  )

  const [userSupply, setUserSupply] = useState(
    {
      your:"0",
      total:"0",
    }
  )


  const [userStakeSolApy , setUserStakeSolApy] = useState(
    "0"
  )
  const [userBorrorwInformation , setUserBorrowInformation] = useState(
    0
  )
  const [userBorrowInformationArray, setUserBorrowInformationArray] = useState([
    {
      token: new PublicKey(0),
      borrowedAmount : BigInt(0),
      collateralAmount :  BigInt(0),
      lastUpdated :  BigInt(0),
    }
  ])

  const [repayData, setRepayData] = useState([
    {
      name: "Rastapepe",
      picture: "https://ipfs.io/ipfs/QmQeSMMH2icVbm3rumZnC21z6YdzD3axJYZ47QpYLcrWPi",
      amount: "2",
      amountToken: "1000000",
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

  const { isOpen: isTokenSelectOpen, onOpen: onTokenSelectOpen, onClose: onTokenSelectClose } = useDisclosure();

  const [userWalletBlance , setUserWalletBlance] = useState(
    0
  )
  const { setVisible } = useWalletModal();
  useEffect(() => {
        //Data init
        setRepayData([])
        //Window size function
        const handleResize = () => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
          });
          setKWindowsSize(window.innerWidth*0.33);
          if(window.innerWidth*0.33<300)
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
        setUserWalletBlance(await getAddressBalance(address));
        console.log("🍺 All my token ::",userTokens , "🚀 Borrow tokens ::",userBorrowTokens)
        if(userTokens  &&userTokens.length>1)
        {
          let tmp = JSON.parse(
            JSON.stringify(userTokens)
          )
          setSelectedTokenInfo(tmp[1])
          setSelectedToken(tmp[1].address);
          console.log("🍺 Selected token :: ",tmp[1])
          const userStakeInfo = await userSolStakeFetch()
          console.log(
            "🍺 Stake information ::",userStakeInfo
          )
          setUserStakeSolInformation(userStakeInfo)
          setUserBorrowInformation(
            Number( userStakeInfo.totalBorrowed)
          )
          setUserStakeSolApy(
            (
              (
                (
                  (
                    Number(userStakeInfo.totalStaked)/Number(userStakeInfo.totalShares))-1
                  )/
            (
              (Date.now()/1000 - 1733369330)/(365*24*3600)
            )
          )*100
          ).toFixed(3) 
          )
          stakeDisplay(userStakeInfo);
          if(userBorrowTokens && userBorrowTokens.length>0)
          {
            const borrowInformationArray = await userTokenBorrowFetch(address,userBorrowTokens);
            console.log("🍺 borrowInformationArray::",borrowInformationArray)
            setUserBorrowInformationArray(
              borrowInformationArray.tokenData 
            )

            
            if(borrowInformationArray.tokenData && borrowInformationArray.tokenData.length > 0)
            {
              await repayDisplay(borrowInformationArray.tokenData)
            }
           
          }

        }
        
        onLoadingClose()
      };

      //When user disconnect wallet
      const onDisconnect = async () => {
        setRepayChartDisplay(false);
      };



      
      const onLoad = async ()=>
      {

            console.log("🍺 wallet not connect init :: ")
            const userStakeInfo = await userSolStakeFetch()
            setUserStakeSolApy(
              (
                (
                  (
                    (
                      Number(userStakeInfo.totalStaked)/Number(userStakeInfo.totalShares))-1
                    )/
              (
                (Date.now()/1000 - 1733369330)/(365*24*3600)
              )
            )*100
            ).toFixed(3) 
            )

      }

      if (connected && publicKey) {
        console.log(
          "🍺 Wallet connect status ::",publicKey,connected
        )
        onConnect(publicKey).catch(console.error);
      }else{
        onDisconnect().catch(console.error);
        // onLoad()
      }

      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    
  }, [connected,publicKey]);

  const stakeDisplay = (userStakeInfo:any) =>
  {
    let _your = ((Number(userStakeInfo.userShares)/Number(userStakeInfo.totalShares))* Number(userStakeInfo.totalStaked)/1e9).toFixed(3);
    if(!_your)
    {
      _your = "0"
    }
    let _total = (Number(userStakeInfo.totalStaked)/1e9).toFixed(3);
    if(!_total)
    {
      _total = "0";
    }
    console.log("🚀 supply culcuation :: ",_your,_total)
    setUserSupply(
      {
        your:_your,
        total:_total
      }
    )
  }
  const repayDisplay = async ( borrowInformationArray:any)=>
  {

    if(!userBorrowTokens || userBorrowTokens.length != borrowInformationArray.length)
    {
      return;
    }
    let borrowTokens = [];
    let tokens = JSON.parse(JSON.stringify(userBorrowTokens))
    for(let i = 0 ; i< borrowInformationArray.length ; i ++)
    {
      let img = tokens[i].info?.image;
      if(!img || img?.length ==0 )
      {
        img = envConfig.token.defaultIcon;
      }
      
      let seed = {
        name: tokens[i].info?.name,
        picture: img,
        amount: (Number(borrowInformationArray[i].borrowedAmount)/1e9).toFixed(3),
        amountToken: (Number(borrowInformationArray[i].collateralAmount)/1e6).toFixed(3),
      }
      borrowTokens.push(seed);
    }

    if(borrowTokens.length>0)
    {
      setRepayChartDisplay(true)
    }
    setRepayData(borrowTokens);
  }
  

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
        setVisible(true)
      }
  }

  const userWithdrawButton = async ()=>
    {
      if(publicKey && signTransaction)
        {
          const addbook = addressBooks(publicKey,selectedToken)
          if(addbook)
          {
            const shares = (withdrawAmount*1e9*(Number(userStakeSolInformation.totalShares)/Number(userStakeSolInformation.totalStaked))).toFixed(0)
            await userWithdrawSol(Number(shares),publicKey,signTransaction);
          }
          onWithdrawClose();
        }else{
          setVisible(true)
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
          setVisible(true)
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
            setVisible(true)
          }
      }


      const userLeverageButton = async ()=>
        {
          if(publicKey && signTransaction)
            {
              const addbook = addressBooks(publicKey,selectedToken)
              if(addbook)
              {
                await userLeverageTokenPump(leverageAmount,publicKey,signTransaction);
              }
            }else{
              setVisible(true)
            }
        }

        const  userClosePositionButton = async ()=>
          {
            if(publicKey && signTransaction)
              {
                const addbook = addressBooks(publicKey,selectedToken)
                if(addbook)
                {
                  await userCloseTokenPump(publicKey,signTransaction);
                }
              }else{
                setVisible(true)
              }
          }
        
      const debugs = async () => 
      {
        // if(publicKey)
        // {
        //   await solanaDataInit(publicKey,selectedToken)
        //   console.log(
        //     await testSoalanData(publicKey)
        //   )
        // }

        // await userClosePositionButton()

        if(publicKey && signTransaction)
        {
          const bk = addressBooks(publicKey,  new PublicKey("Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd"));
          if(bk)
          {
            await pumpBuyTest(publicKey,signTransaction);
            // await pumpSellTest(publicKey,signTransaction);
            
          }
        }

        // onTokenSelectOpen()
       

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
                      <span className="text-success">{userSupply.your }</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Total Supply</span>
                      <span className="text-success">{userSupply.total}</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Total Borrow</span>
                      <span className="text-success">{(userBorrorwInformation/1e9).toFixed(3)}</span>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
                      <span className=" text-xs">Supply APY</span>
                      <span className="text-success">{userStakeSolApy}%</span>
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
        <div className="flex flex-col justify-center gap-1 relative">
          
        <div className="card_head flex justify-between">
        <p>Dposite</p>
        <p className=" text-xs">
          <span>Balance: 0   </span>
          <button className="bg-green-500/50">MAX</button>
        </p>
      </div>
      <div className="card_body flex justify-between items-center text-white" >
        <button className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-green-500/50 hover:bg-black" style={{minWidth:"25%"}}
        onClick={onTokenSelectOpen}
        >
          <Avatar
            className="w-6 h-6 "
            src={
              selectedTokenInfo.info.image ? selectedTokenInfo.info.image : "https://pump.fun/logo.png"
            }
          />
          <span className="text-medium ">{selectedTokenInfo.info.symbol}</span>
          <RiArrowDropDownLine size={24} />
        </button>


        <input
        className=" text-2xl "
        style={{width:"30%"}}
        placeholder={"3915.5243788572"}
        onChange={
          (e:any) => { setBorrowAmount(e.currentTarget.value); }
        } 
        key="payinput" 
        >
          
        </input>
      </div>
      <div className="card_foot flex justify-between  text-xs">
        <p>{selectedTokenInfo.info.name}</p>
      </div>
          <div className="trans-icon rounded-full h-6 w-full flex justify-center">
            <div className="w-6 h-6 flex justify-center bg-white items-center rounded-full shadow-md">
              <FaArrowDown color="blue" />
            </div>
          </div>
      <div className="card_head flex justify-between">
        <p>Borrow</p>
      </div>
      <div className="card_body flex justify-between items-center text-white" >
        <div className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-blue-500/50 hover:bg-black" style={{minWidth:"25%"}}>
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
         
        </p>
      </div>

          <div className="text-center text-gray-500 text-xs">
          Borrow APH : 0.0416 %
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

<iframe title="kline" src="https://www.gmgn.cc/kline/sol/CHUxbA8Y674koHfBERgoir2UQxwLTpW11C7LUgoYpump" width={kWindowsSize + "px"} height={windowSize.height*0.4}></iframe>
<div>
&nbsp;
&nbsp;
&nbsp;
</div>

<div className="flex flex-col gap-6 w-full">
    <div className="flex flex-col justify-center gap-1 relative">

      <div className="card_head flex justify-between">
        <p>Borrow</p>
      </div>
      <p className=" text-xs">
          <span>Balance: 0   </span>
          <button className="bg-green-500/50">MAX</button>
        </p>
      <div className="card_body flex justify-between items-center text-white" >
        <div className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-blue-500/50 hover:bg-black" style={{minWidth:"25%"}}>
          <Avatar
            className="w-6 h-6"
            src="/icon/sol.png"
          />
          <span className="text-medium ">SOL</span>
          
        </div>

        <input
        className=" text-2xl "
        style={{width:"30%"}}
        placeholder={"3915.5243788572"}
        onChange={
          (e:any) => { setLeverageAmount(e.currentTarget.value); }
        } 
        key="payinput" 
        > 
        </input>
        
      </div>
      <div className="card_foot flex justify-between">
        <p>

        </p>
        <p>
          <span>$15 346 144 </span>
        </p>
      </div>
      <div className="trans-icon rounded-full h-6 w-full flex justify-center">
            <div className="w-6 h-6 flex justify-center bg-white items-center rounded-full shadow-md">
              <FaArrowDown color="blue" />
            </div>
      </div>

      <div className="card_head flex justify-between">
        <p>Dposite</p>

      </div>
      <div className="card_body flex justify-between items-center text-white" >
        <button className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-green-500/50 hover:bg-black" style={{minWidth:"25%"}}
        onClick={onTokenSelectOpen}
        >
          <Avatar
            className="w-6 h-6 "
            src={
              selectedTokenInfo.info.image ? selectedTokenInfo.info.image : "https://pump.fun/logo.png"
            }
          />
          <span className="text-medium ">{selectedTokenInfo.info.symbol}</span>
          <RiArrowDropDownLine size={24} />
        </button>


        <p className=" text-2xl">3915.5243788572</p>
      </div>
      <div className="card_foot flex justify-between  text-xs">
        <p>{selectedTokenInfo.info.name}</p>
        <p>
          <span>$15 346 144 </span>
        </p>
      </div>



          <div className="text-center text-gray-500 text-xs">
          Borrow APH : 0.0416 %
          </div>
          <div className="bottom-14 right-0 w-full p-4">
          <Button className="w-full colorfulbuttons" color="success" onClick={userLeverageButton}>
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


{
  repayChartDisplay ? 
  <div className="maincard" style={{minWidth : windowSize.width*0.3 }} >
<Card className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full  justify-center" style={{ width:"100%"}}>
            <CardBody className="py-5 gap-4">
              <div className="flex gap-2.5 justify-center">
                <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                  <span className="text-default-900 text-xl font-semibold">
                    Repay Sol
                  </span>
                </div>
              </div>

              <div className="gap-6">
  <div
    className="w-full"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)", 
      alignItems: "center", 
      justifyItems: "center", 
      gap: "1rem",
    }}
  >
    <div>
      <span className="text-default-900 font-semibold">Tokens</span>
    </div>

    <div>
      <span className="text-default-900 font-semibold">Name</span>
    </div>

    <div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="text-default-900 font-semibold">Colladge</span>
      </div>
    </div>

    <div>
      <span className="text-default-900 font-semibold">Debt</span>
    </div>

    <div>
      <span className="text-default-900 font-semibold">Actions</span>
    </div>
  </div>
</div>


              <div className="gap-6  justify-center ">
              {repayData.map((item) => (
                <div
  key={item.name}
  className="w-full"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)", 
    alignItems: "center", 
    justifyItems: "center", 
    gap: "1rem", 
  }}
>
  <div>
    <Avatar isBordered color="secondary" src={item.picture} />
  </div>

  <div>
    <span className="text-default-900 font-semibold">${item.name}</span>
  </div>

  <div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span className="text-success text-xs">{item.amountToken}</span>
    </div>
  </div>

  <div>
    {item.amount} SOL
  </div>

  <div style={{ display: "flex", gap: "0.5rem" }}>
    <Button color="danger" onClick={userClosePositionButton}>
      Close
    </Button>
    <Button color="success" onClick={userRepayButton}>
      Repay
    </Button>
  </div>
</div>

              ))}
              </div>


            </CardBody>
</Card>
</div>
  : null
}






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
                <span className="text-success text-xs">{userSupply.your}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Supply APY</span>
                <span className="text-success text-xs">{userStakeSolApy}%</span>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Input onChange={(e:any) => { setStakeAmount(e.currentTarget.value); }} key="payinput" description={"BAL : "+Number((userWalletBlance)/1e9).toFixed(3)+" SOL"}  label="Sol" labelPlacement="inside" placeholder="Enter sol amount to deposit" />
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
                <span className="text-success text-xs">{userSupply.your}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Supply APY</span>
                <span className="text-success text-xs">{userStakeSolApy}%</span>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Input onChange={(e:any) => { setWithdrawAmount(e.currentTarget.value); }} key="payinput" description={"Withdrable : "+userSupply.your +" SOL"} label="Sol" labelPlacement="inside" placeholder="Enter sol amount to withdraw" />
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


      {/* Token Select Modal */}
      <Modal isOpen={isTokenSelectOpen} onClose={onTokenSelectClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1"></ModalHeader>
          <ModalBody>
            {/* <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Image alt="chain logo" height={40} src="/icon/sol.png" width={40} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Your Supply</span>
                <span className="text-success text-xs">{userSupply.your}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs">Supply APY</span>
                <span className="text-success text-xs">{userStakeSolApy}%</span>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Input onChange={(e:any) => { setWithdrawAmount(e.currentTarget.value); }} key="payinput" description={"Withdrable : "+userSupply.your +" SOL"} label="Sol" labelPlacement="inside" placeholder="Enter sol amount to withdraw" />
            </div> */}

                  {/* Header */}
      <section className="flex items-center py-2">
        <p className="grow text-center font-bold">Select Token</p>
      </section>
      {/* Search Bar */}
      <section className="flex flex-col gap-2">
        <Input
          labelPlacement="outside"
          placeholder="Search by token address"
          startContent={<FaSearch />}
          type="text"
        />

        <div className="w-full" id="token_search_result">
        <div>Token Not Found</div>
        <div className="gap-6  justify-center w-full">
                <div
                  className="w-full"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    alignItems: "center", 
                    justifyItems: "center", 
                    gap: "1rem", 
                  }}
                >
                  <div>
                    <Avatar isBordered color="secondary" src={"https://pump.fun/logo.png"} />
                  </div>

                  <div>
                    <span className="text-default-900 font-semibold text-xs">${"PUMP COIN"}</span>
                  </div>

                  <div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span className="text-success text-xs">{"BAL 1234"}</span>
                    </div>
                  </div>


                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button color="success" onClick={userRepayButton}>
                      Select
                    </Button>
                  </div>
                </div>
        </div>
        </div>

        <div style={{width:"100%"}} id="my_pump_token">
        <p className="grow text-center font-bold">My Pump Token</p>
        

        {[1, 2, 3].map((item) => (

                  <div className="gap-6  justify-center w-full" key={item}>
                              <br>
                              </br>
                  <div
                    className="w-full"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)", 
                      alignItems: "center", 
                      justifyItems: "center", 
                      gap: "1rem", 
                    }}
                  >
                    <div>
                      <Avatar isBordered color="secondary" src={"https://pump.fun/logo.png"} />
                    </div>
  
                    <div>
                      <span className="text-default-900 font-semibold text-xs">${"PUMP COIN"}</span>
                    </div>
  
                    <div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span className="text-success text-xs">{"BAL 1234"}</span>
                      </div>
                    </div>
  
  
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button color="success" onClick={userRepayButton}>
                        Select
                      </Button>
                    </div>
                  </div>
          </div>
        ))}

        </div>
        
        

        <p className="grow text-center font-bold">Latest Borrow Token</p>
        <div className="search-items flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <Chip
              key={item}
              avatar={
                <Avatar
                  className="w-6 h-6"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                />
              }
              className="cursor-pointer"
              variant="bordered"
              
            >
              Chip {item}
            </Chip>
        ))}
        </div>
      </section>

      {/* NFT List */}
      <section className="flex flex-col justify-center gap-1 text-xs text-blue-gray">
        {/* <div className="flex items-center justify-between">
          <p>Recent</p>
          <p>Clear</p>
        </div> */}
      </section>
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
      </section>
    </DefaultLayout>
  );
}
