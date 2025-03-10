"use client";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { Card, CardBody, CardFooter } from "@nextui-org/card";

import { envConfig } from "@/config/env";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

import { Button, ButtonGroup } from "@nextui-org/button";
import { useState, useEffect } from "react";

import {
  Input,
  Avatar,
  Spinner,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Dropdown,
  Tooltip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { FaTelegram, FaTwitter, FaDiscord } from "react-icons/fa";

import { Image } from "@nextui-org/image";
import { IoIosArrowForward } from "react-icons/io";
import { TbTransferVertical } from "react-icons/tb";
import { Display } from "next/dist/compiled/@next/font";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { AiOutlineStock } from "react-icons/ai";
import { RiArrowDropDownLine } from "react-icons/ri";
import { LuLockKeyhole } from "react-icons/lu";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { BiInfoCircle } from "react-icons/bi";
import { IoWalletOutline } from "react-icons/io5";
import TradeCard from "@/components/TradeCard";
import ReceiveCard from "@/components/ReceiveCard";
import { siteConfig } from "@/config/site";
import { FaArrowLeft } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { Chip } from "@nextui-org/chip";
import { formatTimeInterval } from "@/core/utills";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
  OkxIcon,
  TonspackIcon,
  UXUYIcon,
} from "@/components/icons";

import NbBackground from "@/components/nb-background";

import {
  trySetReferral,
  tryLoadReferral,
  trySetKlineConfig,
  tryGetKlineConfig,
} from "@/core/storage";
import { globalWallet } from "@/core/wallet";
import {
  addressBooks,
  userStakeSol,
  userWithdrawSol,
  userBorrowToken,
  userRepayToken,
  pumpBuyTest,
  pumpSellTest,
  userLeverageTokenPump,
  userCloseTokenPump,
  userCloseTokenRaydium,
  fetchPumpData,
  userLeverageTokenRaydium,
} from "@/core/action";

import {
  solanaDataInit,
  solPriceFetch,
  initFetchData,
  culcuateBorrowAbleToken,
  fetchTokenPumpCurveData,
  culcuateLeverageAbleToken,
} from "@/core/solanaData";

import {
  userTokens,
  userTokenInit,
  getTokenBalance,
  userBorrowTokens,
  userPumpTokens,
  userSolStakeFetch,
  userTokenBorrowFetch,
  getAddressBalance,
  getPumpLtsTokenList,
  getPumpLtsTokenSearch,
  ifRaydium
} from "@/core/tokens";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
// @ts-ignore
import BN from "bn.js";
import { eventBus } from "@/core/events";
import { Pumplend } from "@pumplend/pumplend-sdk";
import { api_pumpmax_get_user_actives } from "@/core/request";
export default function IndexPage() {
  const lend = new Pumplend(
    process.env.NEXT_PUBLIC_NETWORK,
    new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxProgramId),
    undefined,
    new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxVault),
  );
  const { publicKey, connected, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([
    {
      name: "📈 Max Buy",
      color: "success",
      display: true,
    },
    {
      name: "💵 Max Borrow",
      color: "default",
      display: false,
    },
    {
      name: "💰 Earn SOL",
      color: "default",
      display: false,
    },
  ]);
  const [lowData, setLowData] = useState([
    {
      name: "🚀 Positions",
      color: "success",
      display: true,
    },
    {
      name: "⌚ History",
      color: "default",
      display: false,
    },
  ]);
  const [solPrice, setSolPrice] = useState(0);
  // let pumpTokenCurveData : false | any = false;
  const [pumpTokenCurveData, setPumpTokenCurveData] = useState({
    virtualSolReserves: BigInt(0),
    virtualTokenReserves: BigInt(0),
  });

  const [klineDisplay, setKlineDisplay] = useState("none");

  const testFeeRate = 0.01; //1%
  const [walletConnectedLock, setWalletConnectedLock] = useState(false);
  const [stakeAmout, setStakeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [borrowOutAmount, setBorrowOutAmount] = useState(0);
  const [leverageAmount, setLeverageAmount] = useState(0);
  const [leverageAmountTmp, setLeverageAmountTmp] = useState(0);
  const [leverageOutAmount, setLeverageOutAmount] = useState(0);
  const [leverageOutAmountSol, setLeverageOutAmountSol] = useState(0);
  const [leverageOutAmountUSD, setLeverageOutAmountUSD] = useState(0);
  const [repayChartDisplay, setRepayChartDisplay] = useState(true);

  const [selectedToken, setSelectedToken] = useState("");
  const [selectedTokenInfo, setSelectedTokenInfo] = useState({
    address: "6kHQWXdSVc7xFGVYCTynjcBTx1CawFAcQmyp6ou1pump",
    balance: 0,
    associated_account: "",
    info: {
      decimals: 9,
      name: "YuMi",
      symbol: "TM",
      image:
        "https://ipfs.io/ipfs/QmZuUgHgbWnoCDZXANRS45D1B7wbaaa5o4fUuTWK6wCdqY",
      metadata_uri:
        "https://ipfs.io/ipfs/QmRizHbeGYTujVGVeuME2KnMYiCTxu55e2TFWRVqtvy6jY",
    },
  });

  const [userStakeSolInformation, setUserStakeSolInformation] = useState({
    totalStaked: BigInt(0),
    totalShares: BigInt(0),
    totalBorrowed: BigInt(0),
    pendingVaultProfit: BigInt(0),
    userShares: BigInt(0),
  });

  const [userSupply, setUserSupply] = useState({
    your: "0",
    total: "0",
  });

  const [userStakeSolApy, setUserStakeSolApy] = useState("0");

  const [userBorrorwInformation, setUserBorrowInformation] = useState(0);

  const [userSearchToken, setUserSearchToken] = useState("0");
  const [userBorrowInformationArray, setUserBorrowInformationArray] = useState([
    {
      token: new PublicKey(0),
      borrowedAmount: BigInt(0),
      collateralAmount: BigInt(0),
      lastUpdated: BigInt(0),
    },
  ]);

  const [pumpLtsTokens, setPumpLtsTokens] = useState([
    {
      mint: "",
      name: "s",
      symbol: "",
      description: "",
      image_uri: "",
      metadata_uri: "",
      twitter: null,
      telegram: null,
      bonding_curve: "",
      associated_bonding_curve: "",
      creator: "",
      created_timestamp: 0,
      raydium_pool: null,
      complete: false,
      virtual_sol_reserves: 0,
      virtual_token_reserves: 0,
      hidden: null,
      total_supply: 0,
      website: null,
      show_name: true,
      last_trade_timestamp: 0,
      king_of_the_hill_timestamp: null,
      market_cap: 0,
      reply_count: 1,
      last_reply: 0,
      nsfw: false,
      market_id: null,
      inverted: null,
      is_currently_live: false,
      username: null,
      profile_image: null,
      usd_market_cap: 0,
    },
  ]);

  const [pumpSearchToken, setPumpSearchToken] = useState([]);

  const [repayData, setRepayData] = useState([
    {
      address: "",
      name: "Rastapepe",
      picture:
        "https://ipfs.io/ipfs/QmQeSMMH2icVbm3rumZnC21z6YdzD3axJYZ47QpYLcrWPi",
      amount: "2",
      amountToken: "1000000",
      amountSol: "",
      raw: {},
      lastUpdated: "",
    },
  ]);

  const [historyData, setHistoryData] = useState([
    {
      "hash": "49XV4dWfnnEySjj2dC3Pey7cBBRcVq5PUtJrrT5KKMn7ep1cKBAWar25EpWUUCSPCwMqjm7nyr8pXbLgB5TweSvQ",
      "id": "",
      "type": "borrow",
      "user": "",
      "token": "Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd",
      "amount": "10000000000000",
      "blockTime": 1735880077
    },
  ]);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const [kWindowsSize, setKWindowsSize] = useState(0);

  const {
    isOpen: isSupplyOpen,
    onOpen: onSupplyOpen,
    onClose: onSupplyClose,
  } = useDisclosure();
  const {
    isOpen: isWithdrawOpen,
    onOpen: onWithdrawOpen,
    onClose: onWithdrawClose,
  } = useDisclosure();
  const {
    isOpen: isLoadingOpen,
    onOpen: onLoadingOpen,
    onClose: onLoadingClose,
  } = useDisclosure();
  const {
    isOpen: isPendingOpen,
    onOpen: onPendingOpen,
    onClose: onPendingClose,
  } = useDisclosure();

  const {
    isOpen: isTokenSelectOpen,
    onOpen: onTokenSelectOpen,
    onClose: onTokenSelectClose,
  } = useDisclosure();

  const {
    isOpen: isStakeSolOpen,
    onOpen: onStakeSolOpen,
    onClose: onStakeSolClose,
  } = useDisclosure();

  const [userWalletBlance, setUserWalletBlance] = useState(0);
  const { setVisible } = useWalletModal();
  const router = useRouter();

  const stakeDisplayFunction = async(address?:PublicKey)=>
  {
    
      /**
       * Handel Stake information fetch and display
       */
      const userStakeInfo = await userSolStakeFetch(address);
      //console.log("🍺 Stake information ::", userStakeInfo);
      setUserStakeSolInformation(userStakeInfo);
      setUserBorrowInformation(Number(userStakeInfo.totalBorrowed));
      setUserStakeSolApy(
        (
          ((Number(userStakeInfo.totalStaked) /
            Number(userStakeInfo.totalShares) -
            1) /
            ((Date.now() / 1000 - 1738845585) / (365 * 24 * 3600))) *
          100
        ).toFixed(3),
      );
      stakeDisplay(userStakeInfo);
  }
  useEffect(() => {
    
    let walletConnectedLocks = false;
    setKlineDisplay(tryGetKlineConfig());
    //Data init
    setRepayData([]);
    //Window size function
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setKWindowsSize(window.innerWidth * 0.5);
      if (window.innerWidth * 0.33 < 300) {
        setKWindowsSize(window.innerWidth * 0.8);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
   
    setRepayChartDisplay(false)
    //Onload functions
    const onConnect = async (address: PublicKey, foreceReload?: boolean) => {
      setRepayChartDisplay(true)
      if (foreceReload) {
        walletConnectedLocks = false;
      }
      if (walletConnectedLocks) {
        return false;
      } else {
        walletConnectedLocks = true;
      }
      onLoadingOpen();
      await userTokenInit(address);
      setUserWalletBlance(await getAddressBalance(address));

      /**
       * Handel Stake information fetch and display
       */
      await stakeDisplayFunction(globalWallet.address)
      // const userStakeInfo = await userSolStakeFetch(globalWallet.address);
      // //console.log("🍺 Stake information ::", userStakeInfo);
      // setUserStakeSolInformation(userStakeInfo);
      // setUserBorrowInformation(Number(userStakeInfo.totalBorrowed));
      // setUserStakeSolApy(
      //   (
      //     ((Number(userStakeInfo.totalStaked) /
      //       Number(userStakeInfo.totalShares) -
      //       1) /
      //       ((Date.now() / 1000 - 1734619878) / (365 * 24 * 3600))) *
      //     100
      //   ).toFixed(3),
      // );
      // stakeDisplay(userStakeInfo);

      //console.log(
      //   "🍺 All my token ::",
      //   userTokens,
      //   "🚀 Borrow tokens ::",
      //   userBorrowTokens,
      //   "💊 Pump tokens ::",
      //   userPumpTokens,
      // );

      /**
       * Handel Token information fetch and display
       */
      if (userTokens && userTokens.length > 0) {
        // if (userPumpTokens && userPumpTokens.length > 0) {
        //   let pumptmp = JSON.parse(JSON.stringify(userPumpTokens));
        //   setSelectedTokenInfo(pumptmp[0]);
        //   setSelectedToken(pumptmp[0].address);
        //   await updateSolanaInitData(pumptmp[0].address);
        // }

        if (userBorrowTokens && userBorrowTokens.length > 0) {
          const borrowInformationArray = await userTokenBorrowFetch(
            address,
            userBorrowTokens,
          );
          //console.log("🍺 borrowInformationArray::", borrowInformationArray);
          setUserBorrowInformationArray(borrowInformationArray.tokenData);

          if (
            borrowInformationArray.tokenData &&
            borrowInformationArray.tokenData.length > 0
          ) {
            await repayDisplay(borrowInformationArray.tokenData);
          }
        }
      } else {
        //No default token .select the project token as default
      }

      //Do sit hisotry 
      const userHis = await api_pumpmax_get_user_actives(0,50,address.toBase58())
      //console.log("🚀 user his ::",userHis)
      if(userHis && userHis?.code==200 &&userHis?.data)
      {
        setHistoryData(userHis?.data)
      }
      onLoadingClose();
    };

    //When user disconnect wallet
    const onDisconnect = async () => {
      // setRepayChartDisplay(false);
    };

    const onLoad = async () => {
      const solPrice = await solPriceFetch();
      setSolPrice(solPrice);
      await stakeDisplayFunction();
      //console.log("Sol price :: ", solPrice);
      const ltsPump = await getPumpLtsTokenList()
      setPumpLtsTokens(ltsPump);
      // setSelectedTokenInfo(ltsPump[0]);
      // setSelectedToken(ltsPump[0].mint);
      // await updateSolanaInitData(ltsPump[0].mint);
      updateSelectToken(false, ltsPump[0]);
      
    };

    eventBus.on("confirm_connected", async (e: any) => {
      //Wallet connect modal
      //console.log("🍺 Wallet connect status ::", globalWallet);
      onConnect(globalWallet.address).catch(console.error);
    });

    eventBus.on("reload_connected", async (e: any) => {
      //Reload all the data
      setBorrowAmount(0);
      setLeverageAmount(0);
      setStakeAmount(0);
      setWithdrawAmount(0);
      setRepayData([])
      //Onconnect again
      onConnect(globalWallet.address, true).catch(console.error);
    });
    eventBus.on("wallet_disconnected", (e: any) => {
      onDisconnect().catch(console.error);
    });

    eventBus.on("stake_modal_display", (e: any) => {
      onStakeSolOpen();
    });

    eventBus.on("update_selected_token", (e: any) => {
      // //console.log("update_selected_token",e.detail)
      if (e?.detail && e.detail?.mint) {
        updateSelectToken(false, e.detail);
      }
    });

    const init = async () => {
      await onLoad().catch();
      const q = new URLSearchParams(location.search);

      let _type = "";
      let _src = "";
      let _referral = "";
      if (q.getAll("type") && q.getAll("type").length > 0) {
        _type = q.getAll("type")[0];
      }
      if (q.getAll("src") && q.getAll("src").length > 0) {
        _src = q.getAll("src")[0];
      }
      if (q.getAll("referral") && q.getAll("referral").length > 0) {
        _referral = q.getAll("referral")[0];
        setReferralAddress(_referral);
      }

      //console.log(
      //   "🔥 Fetch query ::",
      //   {
      //     _type,
      //     _src,
      //     _referral,
      //   },
      //   q.getAll("type"),
      // );

      if (_type) {
        if (_type == "l") {
          //Leverage
          changeType(data, 0);
        }

        if (_type == "b") {
          //Leverage
          changeType(data, 1);
        }
        if (_type == "s") {
          //Leverage
          changeType(data, 2);
        }
      }

      if (_src) {
        //Try search Token
        await autoSearchAndSelectToken(_src);
      }

      if (_referral) {
        //Set the local referral
        let _ref = "";
        try {
          const ref = new PublicKey(_referral);
          _ref = ref.toBase58();
        } catch (e) {
          console.error(e);
        }
        trySetReferral(_ref);
      }
      //console.log("Ref ::", tryLoadReferral());
    };
    init().catch();
    // onLoad().catch()
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoading]);

  const stakeDisplay = (userStakeInfo: any) => {
    let _your = (
      ((Number(userStakeInfo.userShares) / Number(userStakeInfo.totalShares)) *
        Number(userStakeInfo.totalStaked)) /
      1e9
    ).toFixed(3);
    if (!_your) {
      _your = "0";
    }
    let _total = (Number(userStakeInfo.totalStaked) / 1e9).toFixed(3);
    if (!_total) {
      _total = "0";
    }
    //console.log("🚀 supply culcuation :: ", _your, _total);
    setUserSupply({
      your: _your,
      total: _total,
    });
  };
  const repayDisplay = async (borrowInformationArray: any) => {
    if (
      !userBorrowTokens ||
      userBorrowTokens.length != borrowInformationArray.length
    ) {
      return;
    }
    let borrowTokens = [];
    let tokens = JSON.parse(JSON.stringify(userBorrowTokens));
    for (let i = 0; i < borrowInformationArray.length; i++) {
      let img = tokens[i].info?.image;
      if (!img || img?.length == 0) {
        img = envConfig.token.defaultIcon;
      }

      let seed = {
        address: tokens[i].address as string,
        name: tokens[i].info?.name as string,
        picture: img as string,
        amount: (
          Number(borrowInformationArray[i].borrowedAmount) / 1e9
        ).toFixed(3),
        amountToken: (
          Number(borrowInformationArray[i].collateralAmount) / 1e6
        ).toFixed(3),
        amountSol: (
          Number(borrowInformationArray[i].depositSolAmount) / 1e9
        ).toFixed(3),
        raw: borrowInformationArray[i],
        lastUpdated: Number(borrowInformationArray[i].lastUpdated).toFixed(0),
      };
      borrowTokens.push(seed);
    }

    // setRepayChartDisplay(true);
    // if (borrowTokens.length > 0) {
    //   setRepayChartDisplay(true);
    // }

    // //console.log("✈ borrowInformationArray",borrowTokens , lend.pumplend_estimate_interest(borrowTokens[0].raw))
    setRepayData(borrowTokens);
  };

  const openWalletModal = () => {
    eventBus.emit("wallet_open", {});
  };
  const getReferralAddress = async () => {
    const ref = localStorage.getItem("ref");
    try {
      if (ref && new PublicKey(ref)) {
        return new PublicKey(ref);
      }
    } catch (e) {
      console.error(e);
    }
    return publicKey;
  };
  const setReferralAddress = async (referral: string) => {
    const ref = localStorage.getItem("ref");
    try {
      if (ref && new PublicKey(ref)) {
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return localStorage.setItem("ref", referral);
  };

  const txnSendReload = () => {
    onPendingOpen();
    setTimeout(async () => {
      onPendingClose();
      eventBus.emit("reload_connected", {});
    }, 10000);
  };

  const raydiumLoading = () => {
    onPendingOpen();
    setTimeout(async () => {
      onPendingClose();
    }, 10000);
  };
  const userStakeButton = async () => {
    if (globalWallet.connected) {
      await userStakeSol(stakeAmout, new PublicKey(globalWallet.address));
      onSupplyClose();
      txnSendReload();
    } else {
      openWalletModal();
    }
  };

  const userWithdrawButton = async () => {
    if (globalWallet.connected) {
      const shares = (
        withdrawAmount *
        1e9 *
        (Number(userStakeSolInformation.totalShares) /
          Number(userStakeSolInformation.totalStaked))
      ).toFixed(0);
      await userWithdrawSol(Number(shares), globalWallet.address);

      onWithdrawClose();
      txnSendReload();
    } else {
      openWalletModal();
    }
  };

  const userBorrowButton = async () => {
    if (globalWallet.connected) {
      await userBorrowToken(
        borrowAmount,
        globalWallet.address,
        new PublicKey(selectedToken),
      );
      txnSendReload();
    } else {
      openWalletModal();
    }
  };

  const userRepayButton = async (address: string) => {
    if (globalWallet.connected) {
      //console.log("repay::", address);
      await userRepayToken(globalWallet.address, new PublicKey(address));
      txnSendReload();
    } else {
      openWalletModal();
    }
  };

  const userLeverageButton = async () => {
    
    if (globalWallet.connected) {
      const isRay = await ifRaydium(new PublicKey(selectedToken));
      
      if(isRay)
      {
        //console.log("Try open it via raydium")
        raydiumLoading();
        await userLeverageTokenRaydium(
          leverageAmount,
          globalWallet.address,
          new PublicKey(selectedToken),
        );
      }else{
        await userLeverageTokenPump(
          leverageAmount,
          globalWallet.address,
          new PublicKey(selectedToken),
        );
      }
      txnSendReload();
    } else {
      openWalletModal();
    }
  };

  const userClosePositionButton = async (address: string) => {
    if (globalWallet.connected) {
      const isRay = await ifRaydium(new PublicKey(address));
      
      if(isRay)
      {
        //console.log("Try close it via raydium")
        raydiumLoading();
        await userCloseTokenRaydium(globalWallet.address, new PublicKey(address));
      }else{
        await userCloseTokenPump(globalWallet.address, new PublicKey(address));
      }
      txnSendReload();
    } else {
      openWalletModal();
    }
  };

  const setBorrowAmountFunction = async (amount: number) => {
    setBorrowAmount(amount);

    setBorrowOutAmount(
      await culcuateBorrowAbleToken(
        amount * 1e6,
        new PublicKey(selectedToken),
        new PublicKey(globalWallet.address),
      ),
    );
  };
  const setLeverageAmountFunction = async (amount: number) => {
    setLeverageAmount(amount);
    //console.log("pumpTokenCurveData", pumpTokenCurveData);
    if (pumpTokenCurveData) {
      const maxBorrowAbleData = await culcuateLeverageAbleToken(
        amount * 1e9,
        new PublicKey(selectedToken),
        new PublicKey(globalWallet.address),
      );

      //console.log("max Borrowable data ::", maxBorrowAbleData);
      if (maxBorrowAbleData) {
        setLeverageAmountTmp(amount);
        setLeverageOutAmount(Number(maxBorrowAbleData.token));
        setLeverageOutAmountUSD(
          (Number(maxBorrowAbleData.sol) / 1e9) * solPrice,
        );
        setLeverageOutAmountSol(Number(maxBorrowAbleData.sol));
      }
    }
  };
  const setSelectedTokenFunction = async (address: string, info?: any) => {
    if (userTokens) {
      setSelectedToken(address);
      if (info) {
        setSelectedTokenInfo(info);
      } else {
        userTokens.forEach((ele) => {
          const e = JSON.parse(JSON.stringify(ele));
          if (e?.address == address) {
            setSelectedTokenInfo(e);
          }
        });
      }

      await updateSolanaInitData(address);
    }
  };

  const searchTokenFunction = async (e: any) => {
    if (userSearchToken && userSearchToken?.length > 0) {
      if (e.key === "Enter") {
        setPumpSearchToken(await getPumpLtsTokenSearch(userSearchToken));
      }
    }
  };

  const autoSearchAndSelectToken = async (e: string) => {
    //console.log("🍺 Try search token ", e);
    const tokenSearch = await getPumpLtsTokenSearch(e);
    //console.log("🍺 Try search token :: ", tokenSearch);
    if (tokenSearch.length > 0) {
      //Token exsit . take the first One .
      const token = tokenSearch[0];
      //console.log("🍺Token exsit ::", token);
      // setSelectedToken(token.mint);
      updateSelectToken(false, token);
    }
    return false;
  };

  const updateSelectToken = async (type: boolean, e: any) => {
    let tokenAddress = "";
    let tokenInfo: any = {};
    if (type) {
      //Already know the balance and details
      tokenAddress = e.address;
      tokenInfo = e;
    } else {
      let bal = 0;
      if (publicKey) {
        try {
          bal = Number(await getTokenBalance(new PublicKey(e.mint), publicKey));
        } catch (e) {
          console.error(e);
        }
      }
      tokenAddress = e.mint;
      tokenInfo = {
        address: e.mint,
        balance: bal,
        associated_account: "",
        info: {
          decimals: 6,
          name: e.name,
          symbol: e.symbol,
          image: e.image_uri,
          metadata_uri: e.metadata_uri,
        },
      };
    }
    setSelectedTokenInfo(tokenInfo);
    setSelectedToken(tokenAddress);
    await updateSolanaInitData(tokenAddress);
    onTokenSelectClose();
  };

  const updateSolanaInitData = async (tokenAddress: string) => {
    if (publicKey) {
      solanaDataInit(publicKey, tokenAddress);
      await initFetchData();

      addressBooks(publicKey, tokenAddress);
      const curve = await fetchPumpData(new PublicKey(tokenAddress));
      //console.log("🍺 Curve address :: ", curve);
      if (curve) {
        const curveData = await fetchTokenPumpCurveData(curve.bondingCurve);
        //console.log("Bonding curve data :: ", curveData);
        // pumpTokenCurveData = curveData
        if (curveData) {
          setPumpTokenCurveData({
            virtualSolReserves: curveData.virtualSolReserves,
            virtualTokenReserves: curveData.virtualTokenReserves,
          });
        }
      }
    }
  };

  const changeType = (data: any, index: number) => {
    let tmp = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < tmp.length; i++) {
      tmp[i].color = "default";
      tmp[i].display = false;
    }
    tmp[index].color = "success";
    tmp[index].display = true;
    setData(tmp);
  };

  const changeLowType = (data: any, index: number) => {
    let tmp = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < tmp.length; i++) {
      tmp[i].color = "default";
      tmp[i].display = false;
    }
    tmp[index].color = "success";
    tmp[index].display = true;
    setLowData(tmp);
  };

  const klineControle = () => {
    if (klineDisplay == "none") {
      setKlineDisplay("");
      trySetKlineConfig("");
    } else {
      setKlineDisplay("none");
      trySetKlineConfig("none");
    }
  };

  const displayHowItWorks = () => {
    eventBus.emit("display_how_it_works", {});
  };

  const displayReferral = () => {
    eventBus.emit("display_referral", {});
  };

  const displayFauct = () => {
    eventBus.emit("display_fauct", {});
  };

  const userLeverageCardDisplay = (w: number) => {
    return (
      <div className="flex flex-col gap-6" style={{ width: w + "%" }}>
        <div className="flex flex-col justify-center gap-1 relative">
          <div className="card_head flex justify-between">
            <p>Deposite</p>
            <p className=" text-xs">
              {/* <span style={{color:"gray"}}>BAL: {(userWalletBlance/1e9).toFixed(3)} SOL  </span> */}
              &nbsp; &nbsp; &nbsp;
              <button
                className="bg-green-500/50"
                onClick={() => {
                  setLeverageAmountFunction(
                    Math.floor(userWalletBlance / (2 * 1e6)) / 1e3,
                  );
                }}
              >
                {" "}
                50%{" "}
              </button>
              &nbsp; &nbsp; &nbsp;
              <button
                className="bg-green-500/50"
                onClick={() => {
                  setLeverageAmountFunction(
                    Math.floor(userWalletBlance / 1e6) / 1e3,
                  );
                }}
              >
                {" "}
                MAX{" "}
              </button>
            </p>
          </div>

          <div className="card_body flex justify-between items-center text-white">
            <div
              className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-blue-500/50 hover:bg-black"
              style={{ minWidth: "15%" }}
            >
              <Avatar className="w-6 h-6" src="/icon/sol.png" />
              <span className="text-medium ">SOL</span>
            </div>

            <input
              className=" text-3xl "
              style={{
                width: "70%",
                textAlign: "right",
                backgroundColor: "transparent",
                color:
                  leverageAmount > userWalletBlance / 1e9 ? "red" : "white",
              }}
              placeholder={(userWalletBlance / 1e9).toFixed(3)}
              min={"0"}
              max={(userWalletBlance / 1e9).toFixed(3)}
              step="0.1"
              onChange={(e: any) => {
                setLeverageAmountFunction(e.currentTarget.value);
              }}
              value={leverageAmount ? leverageAmount : ""}
              key="payinput"
              type="number"
            ></input>
          </div>
          <div className="card_foot flex justify-between">
            <p></p>
            <p>
              <span className="text-xl" style={{ color: "gray" }}>
                ~${Number((leverageAmount * solPrice).toFixed(3))}{" "}
              </span>
            </p>
          </div>
          <div className="trans-icon rounded-full h-6 w-full flex justify-center">
            <div className="w-6 h-6 flex justify-center bg-white items-center rounded-full shadow-md">
              <FaArrowDown color="blue" />
            </div>
          </div>

          <div className="card_head flex justify-between">
            <p>Leverage</p>
          </div>
          <div className="card_body flex justify-between items-center text-white">
            <button
              className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-green-500/50 hover:bg-black"
              style={{ minWidth: "15%" }}
              onClick={onTokenSelectOpen}
            >
              <Avatar
                className="w-6 h-6 "
                src={
                  selectedTokenInfo.info.image
                    ? selectedTokenInfo.info.image
                    : "https://pump.fun/logo.png"
                }
              />
              <span className="text-medium ">
                {selectedTokenInfo.info.symbol}
              </span>
              <RiArrowDropDownLine size={24} />
            </button>

            <p className=" text-3xl">
              {Number((leverageOutAmount / 1e6).toFixed(3))}
            </p>
          </div>
          <div className="card_foot flex justify-between  text-xs">
            {/* <p>{selectedTokenInfo.info.name}</p> */}
            <p></p>
            <p>
              <span className="text-xl" style={{ color: "gray" }}>
                ~${Number(leverageOutAmountUSD.toFixed(3))}{" "}
              </span>
            </p>
          </div>

          {leverageOutAmount ? (
            <div className="text-center text-xs">
              Congrats! Hit
              <span className="text-xl text-gray-500" style={{ color: "red" }}>
                {" " +
                  (
                    Number(leverageOutAmountSol) /
                    (leverageAmountTmp * 1e7)
                  ).toFixed(1)}
                %
              </span>
              max coins at{" "}
              <a
                style={{ textDecoration: "underline" }}
                className="text-green-500"
                onClick={() => {
                  window.open("http://pump.fun/" + selectedToken);
                }}
              >
                pump.fun
              </a>
            </div>
          ) : null}
          <div className="text-center text-gray-500 text-xs">
            Borrow Hourly Percentage Rate : 0.0416 %
          </div>
          <div className="bottom-14 right-0 w-full p-4">
            <Button
              className="w-full colorfulbuttons"
              color="success"
              onClick={userLeverageButton}
            >
              {leverageOutAmount
                ? (
                    Number(leverageOutAmountSol) /
                    (leverageAmountTmp * 1e9)
                  ).toFixed(1) + "x"
                : "Max"}
              &nbsp; Buy
            </Button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <DefaultLayout>
      {windowSize.width > 500 ? (
        <NbBackground width={windowSize.width} />
      ) : null}
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full mt-[-100px] md:mt-0  ">
        <div
          className="inline-block max-w-xl text-center  py-2 md:py-4 justify-center"
          style={{ display: siteConfig.isHeadless }}
        >
          {/* <span className={title()}>&nbsp;</span> */}
          {/* <span className={title({ color: "green" })+" github"}>Max Pump Coin&nbsp;</span> */}

          {windowSize.width > 500 ? null : (
            <a onClick={displayHowItWorks}>[How it works]</a>
          )}
            &nbsp;&nbsp;&nbsp;
          {windowSize.width > 500 ? null : (
            <a 
            onClick={()=>{
              window.open("https://explorer.pumpmax.fun/")
            }}
            >[Explorer]</a>
          )}
           &nbsp;&nbsp;&nbsp;
          {windowSize.width > 500 ? null : (
            <a 
            onClick={()=>{
              window.open("https://docs.pumpmax.fun/")
            }}
            >[Docs]</a>
          )}

          {/* <Button onClick={debugs}> Debug</Button> */}
          {/* <span className={title({ color: "green" })}>Memecoin&nbsp;</span> */}
          {/* <br />
          <span className={title()}>
            Release SOL 
          </span> */}
        </div>

        {/* {
          windowSize.width > 500 ?   <br></br> :null
        } */}
        <div
          style={{ width: "100%", minWidth: "300px" }}
          className="inline-block max-w-xl text-center justify-center item-center"
        >
          <ButtonGroup>
            {data.map((item: any, index: number) => (
              <Button
                key={index}
                color={item.color}
                onClick={() => {
                  changeType(data, index);
                }}
              >
                {item.name}
                {/* {
                  index == 2 ? 
                  " : "+userStakeSolApy+"%" : null
                }  */}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div className="maincard" style={{ minWidth: windowSize.width * 0.32 }}>
          {data[1].display ? (
            <Card
              className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full"
              style={{ width: "100%" }}
            >
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
                      <p>Deposite</p>
                      <p className=" text-xs">
                        <span style={{ color: "gray" }}>
                          Balance:{" "}
                          {selectedTokenInfo.balance.toFixed(3)
                            ? selectedTokenInfo.balance.toFixed(3)
                            : 0}{" "}
                        </span>
                        &nbsp; &nbsp; &nbsp;
                        <button
                          className="bg-green-500/50"
                          onClick={() => {
                            setBorrowAmountFunction(
                              Math.floor(selectedTokenInfo.balance) / 2,
                            );
                          }}
                        >
                          {" "}
                          &nbsp;50%&nbsp;{" "}
                        </button>
                        &nbsp; &nbsp; &nbsp;
                        <button
                          className="bg-green-500/50"
                          onClick={() => {
                            setBorrowAmountFunction(
                              Math.floor(selectedTokenInfo.balance),
                            );
                          }}
                        >
                          {" "}
                          &nbsp;MAX&nbsp;{" "}
                        </button>
                      </p>
                    </div>
                    <div className="card_body flex justify-between items-center text-white">
                      <button
                        className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-green-500/50 hover:bg-black"
                        style={{ minWidth: "15%" }}
                        onClick={onTokenSelectOpen}
                      >
                        <Avatar
                          className="w-6 h-6 "
                          src={
                            selectedTokenInfo.info.image
                              ? selectedTokenInfo.info.image
                              : "https://pump.fun/logo.png"
                          }
                        />
                        <span className="text-medium ">
                          {selectedTokenInfo.info.symbol}
                        </span>
                        <RiArrowDropDownLine size={24} />
                      </button>

                      <input
                        className=" text-3xl "
                        style={{
                          width: "70%",
                          textAlign: "right",
                          backgroundColor: "transparent",
                          color:
                            borrowAmount > Number(selectedTokenInfo.balance)
                              ? "red"
                              : "white",
                        }}
                        placeholder={
                          selectedTokenInfo.balance.toFixed(3)
                            ? selectedTokenInfo.balance.toFixed(3)
                            : "0"
                        }
                        onChange={(e: any) => {
                          setBorrowAmountFunction(e.currentTarget.value);
                        }}
                        min={"0"}
                        max={selectedTokenInfo.balance.toFixed(3)}
                        step="0.1"
                        key="payinput"
                        value={borrowAmount}
                        type="number"
                      ></input>
                    </div>
                    <div className="card_foot flex justify-between  text-xs">
                      {/* <p>{selectedTokenInfo.info.name}</p> */}
                    </div>
                    <div className="trans-icon rounded-full h-6 w-full flex justify-center">
                      <div className="w-6 h-6 flex justify-center bg-white items-center rounded-full shadow-md">
                        <FaArrowDown color="blue" />
                      </div>
                    </div>
                    <div className="card_head flex justify-between">
                      <p>Borrow</p>
                    </div>
                    <div className="card_body flex justify-between items-center text-white">
                      <div
                        className="flex items-center gap-2 rounded-xl p-2 cursor-pointer bg-blue-500/50 hover:bg-black"
                        style={{ minWidth: "15%" }}
                      >
                        <Avatar className="w-6 h-6" src="/icon/sol.png" />
                        <span className="text-medium ">SOL</span>
                      </div>
                      <p className=" text-3xl">
                        {(borrowOutAmount / 1e9).toFixed(3)}
                      </p>
                    </div>
                    <div className="card_foot flex justify-between">
                      <p></p>
                      <p>
                        <span style={{ color: "gray" }}>
                          ~${((borrowOutAmount * solPrice) / 1e9).toFixed(3)}
                        </span>
                      </p>
                    </div>

                    <div className="text-center text-gray-500 text-xs">
                      Borrow Hourly Percentage Rate : 0.0416 %
                    </div>
                    <div className="bottom-14 right-0 w-full p-4">
                      <Button
                        className="w-full colorfulbuttons"
                        color="success"
                        onClick={userBorrowButton}
                      >
                        Borrow SOL
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {data[0].display ? (
            <Card
              className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full  justify-center"
              style={{ width: "100%" }}
            >
              <CardBody className="py-5 gap-4">
                <div className="flex gap-2.5 justify-center">
                  <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                    <span className="text-default-900 text-xl font-semibold">
                      Max Buy
                    </span>
                  </div>
                </div>

                <div className="w-full justify-left">
                  <Button
                    style={{ marginRight: "0px", width: "100%" }}
                    variant="bordered"
                    onClick={() => {
                      klineControle();
                    }}
                  >
                    <AiOutlineStock size="48" />
                  </Button>
                </div>

                <div
                  className="flex"
                  style={{
                    width: "100%",
                    flexWrap: windowSize.width > 800 ? "nowrap" : "wrap",
                  }}
                >
                  <div className="iframe-container">
                    <iframe
                      className="rounded-frame"
                      style={{
                        display: klineDisplay,
                      }}
                      title="kline"
                      src={`https://hellodex.io/kline/en/SOLANA/${selectedToken}?timeType=1s`}
                      width={kWindowsSize + "px"}
                      height={windowSize.height * 0.6}
                    ></iframe>
                  </div>

                  {/* {
          windowSize.width<800?
          <Button  className="w-full" style={{height:"40px"}} variant="bordered" onClick={()=>{
            klineControle()
          }}>
          <AiOutlineStock size="48" />
        </Button>
        :
        <Button  style={{width:'40px', height:windowSize.height*0.3}} variant="bordered" onClick={()=>{
          klineControle()
        }}>
        <AiOutlineStock size="48" />
      </Button>
        } */}
                  <div></div>
                  <div>&nbsp; &nbsp; &nbsp;</div>
                  {klineDisplay || windowSize.width < 800
                    ? userLeverageCardDisplay(100)
                    : userLeverageCardDisplay(30)}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {data[2].display ? (
            <Card
              className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full"
              style={{ width: "100%" }}
            >
              <CardBody className="py-5 gap-4">
                <div className="flex gap-2.5 justify-center">
                  <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                    <span className="text-default-900 text-xl font-semibold">
                      Stake Sol
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 justify-center">
                  <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                    <span className="text-default-900 text-sm font-semibold">
                    PUMPMAX <a style={{color:"red"}}>mainnet-beta version</a> is now live . So be careful while staking SOL .
                    </span>
                  </div>
                </div>

                
                <div
                  className="flex flex-col gap-6 w-full"
                  style={{ minWidth: windowSize.width * 0.3 }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Image
                      alt="chain logo"
                      height={40}
                      src="/icon/sol.png"
                      width={40}
                    />

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className=" text-xs">Your Supply</span>
                      <span className="text-success">{userSupply.your}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className=" text-xs">Total Supply</span>
                      <span className="text-success">{userSupply.total}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className=" text-xs">Total Borrow</span>
                      <span className="text-success">
                        {(userBorrorwInformation / 1e9).toFixed(3)}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className=" text-xs">Supply APY</span>
                      <span className="text-success">{userStakeSolApy}%</span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      color="success"
                      onClick={onSupplyOpen}
                      style={{ width: "47%" }}
                    >
                      ➕ Supply
                    </Button>
                    <Button
                      color="danger"
                      onClick={onWithdrawOpen}
                      style={{ width: "47%" }}
                    >
                      ➖ Withdraw
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <br></br>

{
  repayChartDisplay ? 
  <div
  style={{ width: "100%", minWidth: "300px" }}
  className="inline-block max-w-xl text-center justify-center item-center"
>
  <ButtonGroup>
    {lowData.map((item: any, index: number) => (
      <Button
        key={index}
        color={item.color}
        onClick={() => {
          changeLowType(lowData, index);
        }}
      >
        {item.name}
      </Button>
    ))}
  </ButtonGroup>
</div> : 
null
}


        {
        (lowData[0].display&&repayChartDisplay) ? (
          <div
            className="maincard"
            style={{ minWidth: windowSize.width * 0.3 }}
          >
            <Card
              className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full  justify-center"
              style={{ width: "100%" }}
            >
              <CardBody className="py-5 gap-4">
                <div className="flex gap-2.5 justify-center">
                  <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                    <span className="text-default-900 text-xl font-semibold">
                      Active Positions
                    </span>
                  </div>
                </div>

                <div className="gap-6">
                  <div
                    className="w-full"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      alignItems: "center",
                      justifyItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <span className="text-default-900 font-semibold">
                        Token
                      </span>
                    </div>

                    <div>
                      <span className="text-default-900 font-semibold">
                        Name
                      </span>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span className="text-default-900 font-semibold">
                          Collateral
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-default-900 font-semibold">
                        Debt
                      </span>
                    </div>

                    <div>
                      <span className="text-default-900 font-semibold">
                        Liquidation Timer
                      </span>
                    </div>

                    <div>
                      <span className="text-default-900 font-semibold">
                        Interest
                      </span>
                    </div>
                    <div>
                      <span className="text-default-900 font-semibold">
                        Action
                      </span>
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
                        gridTemplateColumns: "repeat(7, 1fr)",
                        alignItems: "center",
                        justifyItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <Avatar
                          isBordered
                          color="secondary"
                          src={item.picture}
                        />
                      </div>

                      <div>
                        <span className="text-default-900 font-semibold">
                          ${item.name}
                        </span>
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <span className="text-success text-xs">
                            {item.amountToken}
                          </span>
                          {Number(item.amountSol) ? (
                            <span className="text-success text-xs">
                              {item.amountSol} SOL
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div>{
                        (Number(item.amountSol)+Number(item.amount)).toFixed(3)
                        } SOL</div>

                      <div>
                        {formatTimeInterval(
                          lend.pumplend_estimate_interest(item.raw, testFeeRate)
                            .liquiteRemainingTime,
                        ).days > 0
                          ? formatTimeInterval(
                              lend.pumplend_estimate_interest(
                                item.raw,
                                testFeeRate,
                              ).liquiteRemainingTime,
                            ).days
                          : 0}
                        <span className="text-success text-xl"> D </span>
                        {Math.floor(
                          formatTimeInterval(
                            lend.pumplend_estimate_interest(
                              item.raw,
                              testFeeRate,
                            ).liquiteRemainingTime,
                          ).hours,
                        )}
                        <span className="text-success text-xl"> H </span>
                        {
                          formatTimeInterval(
                            lend.pumplend_estimate_interest(
                              item.raw,
                              testFeeRate,
                            ).liquiteRemainingTime,
                          ).minutes
                        }
                        <span className="text-success text-xl"> M </span>
                      </div>

                      <div>
                        {Number(
                          (
                            Number(
                              lend.pumplend_estimate_interest(
                                item.raw,
                                testFeeRate,
                              ).interest
                            ) / 1e9
                          ),
                        )}{" "}
                        SOL
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          color="danger"
                          onClick={() => {
                            userClosePositionButton(item.address);
                          }}
                        >
                          Close
                        </Button>
                        <Button
                          color="success"
                          onClick={() => {
                            userRepayButton(item.address);
                          }}
                        >
                          Repay
                        </Button>
                      </div>
                      <br></br>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}
        {(lowData[1].display&&repayChartDisplay) ? (
          <div
            className="maincard"
            style={{ minWidth: windowSize.width * 0.3 }}
          >
            <Card
              className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full  justify-center"
              style={{ width: "100%" }}
            >
              <CardBody className="py-5 gap-4">
                <div className="flex gap-2.5 justify-center">
                  <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                    <span className="text-default-900 text-xl font-semibold">
                      History
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
                      <span className="text-default-900 font-semibold">
                        Action
                      </span>
                    </div>
                    <div>
                      <span className="text-default-900 font-semibold">
                        Token
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span className="text-default-900 font-semibold">
                          Amount
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-default-900 font-semibold">
                        Time
                      </span>
                    </div>

                    <div>
                      <span className="text-default-900 font-semibold">
                       Hash
                      </span>
                    </div>
                  </div>
                </div>

                <div className="gap-6  justify-center ">
                  {historyData.map((item) => (
                    <div
                      key={item.hash}
                      className="w-full"
                      style={{
                        display: item.blockTime == 1735880077 ?"none":"grid" ,
                        gridTemplateColumns: "repeat(5, 1fr)",
                        alignItems: "center",
                        justifyItems: "center",
                        gap: "1rem",
                      }}
                    >
                                            <div>
                        
                        {
                          item.type == "borrow" ?
                          <Chip color="success">
                           BORROW
                          </Chip>
                          :null
                        }
                        {
                          (item.type == "borrowLoopPump" ||item.type == "borrowLoopRaydium"  ) ?
                          <Chip color="success">
                           MAX BUY
                          </Chip>
                          :null
                        }
                        {
                          item.type == "repay" ?
                          <Chip color="primary">
                           REPAY
                          </Chip>
                          :null
                        }
                        {
                          item.type == "stake" ?
                          <Chip color="primary">
                           STAKE
                          </Chip>
                          :null
                        }
                        {
                          item.type == "withdraw" ?
                          <Chip color="warning">
                           WITHDRAW
                          </Chip>
                          :null
                        }
                        {
                          item.type == "liquidatePump" || item.type == "liquidateRaydium" ?
                          <Chip color="danger">
                           CLOSE
                          </Chip>
                          :null
                        }
                      </div>

                      <div>
                        
                         {
                          item?.token?
                         `${item.token.slice(0, 10)}...`:
                         "NA"
                         }
                        
                      </div>




                      <div>
                      <span >
                          {
                            ( item.type == "stake"  || item.type == "borrowLoopRaydium" || item.type == "borrowLoopPump" )?
                            Number(Number(Number(item.amount)/1e9).toFixed(3))+" SOL"
                            :null
                          }
                          {
                            (item.type == "borrow")?
                            Number(Number(Number(item.amount)/1e6).toFixed(3))+ " Coin"
                            :null
                          }
                          {/* {
                            ( item.type == "stake" )?
                            Number(Number(Number(item.amount)/1e9).toFixed(3))+" SOL"
                            :null
                          }
                          {
                            (item.type == "borrow" || item.type == "borrowLoopRaydium" || item.type == "borrowLoopPump")?
                            Number(Number(Number(item.amount)/1e6).toFixed(3))+" $"
                            :null
                          } */}
                          </span>
                      </div>

                      <div>
                        <span className="text-default-900 font-semibold">
                          {
                           (new Date(Number(item.blockTime)*1000)).toLocaleString()
                          }
                        </span>
                      </div>
                      <a 
                      onClick={() => {
                        window.open(`https://explorer.solana.com/tx/${item.hash}?cluster=${process.env.NEXT_PUBLIC_NETWORK}`);
                      }}
                      className="text-success"
                      >
                      {item.hash.slice(0, 20)}...
                      </a>
                      

                      <br></br>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}

        <div>
          {/* All the models */}

          {/* Supply Modal */}
          <Modal
            isOpen={isSupplyOpen}
            onClose={onSupplyClose}
            scrollBehavior={"inside"}
          >
            <ModalContent>
              <ModalHeader className="flex w-full">
                <div className="flex w-full justify-center items-center text-3xl">
                  Supply SOL
                </div>
              </ModalHeader>
              <ModalBody>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Image
                    alt="chain logo"
                    height={50}
                    src="/icon/sol.png"
                    width={50}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-l">Your Supply</span>
                    <span className="text-success text-xl">
                      {userSupply.your}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-l">Supply APY</span>
                    <span className="text-success text-xl">
                      {userStakeSolApy}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <input
                    className=" text-3xl "
                    style={{
                      width: "100%",
                      textAlign: "center", // backgroundColor:"transparent" ,
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    placeholder={
                      Number(userWalletBlance / 1e9)
                        ? Number(userWalletBlance / 1e9).toFixed(3)
                        : "0"
                    }
                    onChange={(e: any) => {
                      setStakeAmount(e.currentTarget.value);
                    }}
                    key="payinput"
                    value={stakeAmout ? stakeAmout : ""}
                    type="number"
                  ></input>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="text-sm">
                    {"BAL : " +
                      Number(userWalletBlance / 1e9).toFixed(3) +
                      " SOL"}
                  </div>

                  <div className="text-sm">
                    <button
                      className="bg-green-500/50"
                      onClick={() => {
                        setStakeAmount(
                          Math.floor(Number(userWalletBlance / 1e7)) / 200,
                        );
                      }}
                    >
                      {" "}
                      &nbsp;50%&nbsp;{" "}
                    </button>
                    &nbsp; &nbsp; &nbsp;
                    <button
                      className="bg-green-500/50"
                      onClick={() => {
                        setStakeAmount(
                          Math.floor(Number(userWalletBlance / 1e7)) / 100,
                        );
                      }}
                    >
                      {" "}
                      &nbsp;MAX&nbsp;{" "}
                    </button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  onClick={userStakeButton}
                  style={{ width: "100%" }}
                >
                  Apply
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Account loading Modal */}
          <Modal
            isOpen={isWithdrawOpen}
            onClose={onWithdrawClose}
            scrollBehavior={"inside"}
          >
            <ModalContent>
              <ModalHeader className="flex w-full">
                <div className="flex w-full justify-center items-center text-3xl">
                  Withdraw SOL
                </div>
              </ModalHeader>
              <ModalBody>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Image
                    alt="chain logo"
                    height={50}
                    src="/icon/sol.png"
                    width={50}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-l">Your Supply</span>
                    <span className="text-success text-xl">
                      {userSupply.your}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-l">Supply APY</span>
                    <span className="text-success text-xl">
                      {userStakeSolApy}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <input
                    className=" text-3xl "
                    style={{
                      width: "100%",
                      textAlign: "center", // backgroundColor:"transparent" ,
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    placeholder={userSupply.your ? userSupply.your : "0"}
                    onChange={(e: any) => {
                      setWithdrawAmount(e.currentTarget.value);
                    }}
                    key="payinput"
                    value={withdrawAmount ? withdrawAmount : ""}
                  ></input>
                  {/* <Input onChange={(e:any) => { setWithdrawAmount(e.currentTarget.value); }} key="payinput" description={"Withdrable : "+userSupply.your +" SOL"} label="Sol" labelPlacement="inside" placeholder="Enter sol amount to withdraw" /> */}
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="text-sm">
                    {"Locked : " + userSupply.your + " SOL"}
                  </div>

                  <div className="text-sm">
                    <button
                      className="bg-green-500/50"
                      onClick={() => {
                        setWithdrawAmount(
                          Math.floor(Number(userSupply.your) * 100) / 200,
                        );
                      }}
                    >
                      {" "}
                      &nbsp;50%&nbsp;{" "}
                    </button>
                    &nbsp; &nbsp; &nbsp;
                    <button
                      className="bg-green-500/50"
                      onClick={() => {
                        setWithdrawAmount(
                          Math.floor(Number(userSupply.your) * 100) / 100,
                        );
                      }}
                    >
                      {" "}
                      &nbsp;MAX&nbsp;{" "}
                    </button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  onClick={userWithdrawButton}
                  style={{ width: "100%" }}
                >
                  Withdraw
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Loading Modal */}
          <Modal
            isOpen={isLoadingOpen}
            onClose={onLoadingClose}
            hideCloseButton={true}
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            style={{ backgroundColor: "transparent", marginTop: "-20%" }}
          >
            <ModalContent>
              <ModalBody>
                <div className="items-center text-center w-full justify-center">
                  <div className="spinner-box">
                    <div className="blue-orbit leo"></div>

                    <div className="green-orbit leo"></div>

                    <div className="red-orbit leo"></div>

                    <div className="white-orbit w1 leo"></div>
                    <div className="white-orbit w2 leo"></div>
                    <div className="white-orbit w3 leo"></div>
                  </div>

                  <div className="text-3xl">Account Loading ...</div>
                </div>

                {/* <Spinner  style={{height:"300px"}} color="warning" label="Account Loading ..." /> */}
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Transaction pending Modal */}
          <Modal
            isOpen={isPendingOpen}
            onClose={onPendingClose}
            hideCloseButton={true}
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            style={{ backgroundColor: "transparent", marginTop: "-20%" }}
          >
            <ModalContent>
              <ModalBody>
                <div className="w-full items-center justify-center text-center">
                  <Spinner size="lg" color="warning" />
                  <div className="text-3xl">Transaction pending ...</div>
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>

          <Modal
            isOpen={isWithdrawOpen}
            onClose={onWithdrawClose}
            scrollBehavior={"inside"}
          >
            <ModalContent>
              <ModalHeader className="flex w-full">
                <div className="flex w-full justify-center items-center text-3xl">
                  Withdraw SOL
                </div>
              </ModalHeader>
              <ModalBody>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Image
                    alt="chain logo"
                    height={50}
                    src="/icon/sol.png"
                    width={50}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-l">Your Supply</span>
                    <span className="text-success text-xl">
                      {userSupply.your}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-l">Supply APY</span>
                    <span className="text-success text-xl">
                      {userStakeSolApy}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <input
                    className=" text-3xl "
                    style={{
                      width: "100%",
                      textAlign: "center", // backgroundColor:"transparent" ,
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    placeholder={userSupply.your ? userSupply.your : "0"}
                    onChange={(e: any) => {
                      setWithdrawAmount(e.currentTarget.value);
                    }}
                    key="payinput"
                    value={withdrawAmount ? withdrawAmount : ""}
                  ></input>
                  {/* <Input onChange={(e:any) => { setWithdrawAmount(e.currentTarget.value); }} key="payinput" description={"Withdrable : "+userSupply.your +" SOL"} label="Sol" labelPlacement="inside" placeholder="Enter sol amount to withdraw" /> */}
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="text-sm">
                    {"Locked : " + userSupply.your + " SOL"}
                  </div>

                  <div className="text-sm">
                    <button
                      className="bg-green-500/50"
                      onClick={() => {
                        setWithdrawAmount(
                          Math.floor(Number(userSupply.your) * 100) / 200,
                        );
                      }}
                    >
                      {" "}
                      &nbsp;50%&nbsp;{" "}
                    </button>
                    &nbsp; &nbsp; &nbsp;
                    <button
                      className="bg-green-500/50"
                      onClick={() => {
                        setWithdrawAmount(
                          Math.floor(Number(userSupply.your) * 100) / 100,
                        );
                      }}
                    >
                      {" "}
                      &nbsp;MAX&nbsp;{" "}
                    </button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  onClick={userWithdrawButton}
                  style={{ width: "100%" }}
                >
                  Withdraw
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Token Select Modal */}
          <Modal
            isOpen={isTokenSelectOpen}
            onClose={onTokenSelectClose}
            scrollBehavior={"inside"}
          >
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
                    placeholder="Search token CA"
                    startContent={<FaSearch />}
                    type="text"
                    onChange={async (e: any) => {
                      setUserSearchToken(e.currentTarget.value);

                      if(e.currentTarget.value.length == 44)
                      {
                        setPumpSearchToken(await getPumpLtsTokenSearch(e.currentTarget.value));
                      }
                    }}
                    onKeyDown={searchTokenFunction}
                  />

                  <div className="w-full" id="token_search_result">
                    {pumpSearchToken.length > 0 ? (
                      pumpSearchToken.map((item: any) => (
                        <div
                          className="gap-6 justify-center w-full rounded-lg shadow-md button-container"
                          style={{
                            padding: "1rem",
                            borderRadius: "12px",
                          }}
                          onClick={() => {
                            updateSelectToken(false, item);
                          }}
                        >
                          <div
                            className="w-full"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              alignItems: "center",
                              justifyItems: "center",
                              gap: "1rem",
                            }}
                          >
                            <div>
                              <Avatar
                                isBordered
                                color="default"
                                src={item?.image_uri}
                              />
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "left",
                              }}
                            >
                              <span className="text-default-900 font-semibold text-xs">
                                {item?.symbol}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "left",
                              }}
                            >
                              <span className="text-default-900 font-semibold text-xs">
                                {item?.mint.slice(0, 15)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className="w-full"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(1, 1fr)",
                          alignItems: "center",
                          justifyItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div>No Token Found</div>
                      </div>
                    )}
                  </div>

                  <br></br>
                  <div style={{ width: "100%" }} id="my_pump_token">
                    {userPumpTokens ? (
                      <p className="grow text-center font-bold">
                        My Pump Token
                      </p>
                    ) : null}

                    {userPumpTokens
                      ? userPumpTokens.map((item: any) => (
                          <div
                            className="gap-6 justify-center w-full rounded-lg shadow-md button-container"
                            style={{
                              padding: "1rem",
                              borderRadius: "12px",
                            }}
                            onClick={() => {
                              setSelectedTokenFunction(item.address);
                              updateSelectToken(true, item);
                            }}
                          >
                            <div
                              className="w-full"
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                alignItems: "center",
                                justifyItems: "center",
                                gap: "1rem",
                              }}
                            >
                              <div>
                                <Avatar
                                  isBordered
                                  color="default"
                                  src={
                                    item.info.image ? item.info.image : "https://pump.fun/logo.png"
                                  }
                                />
                              </div>

                              {/* <div  style={{ display: "flex", flexDirection: "column", alignItems: "left" }}>
                    <span className="text-default-900 font-semibold text-xs">{item.info.symbol}</span>

                      <span className="text-default-900 font-semibold text-xs">{item.address.slice(0, 5)}...</span>
                    
                    </div> */}

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "left",
                                }}
                              >
                                <span className="text-default-900 font-semibold text-l">
                                  {item.info.symbol}
                                </span>

                                <span className="text-default-900 font-semibold text-xs text-gray-500">
                                  {item.address.slice(0, 15)}...
                                </span>
                              </div>

                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}
                                >
                                  <span className="text-success text-l">
                                    {Number(item.balance).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      : null}
                  </div>
                  <br></br>

                  <p className="grow text-center font-bold">
                    Latest PUMP Token
                  </p>
                  <div className="search-items flex flex-wrap gap-2">
                    {pumpLtsTokens.map((item, index) => (
                      <Chip
                        key={index}
                        avatar={
                          <Avatar className="w-6 h-6" src={item.image_uri} />
                        }
                        className="cursor-pointer"
                        variant="bordered"
                        onClick={() => {
                          updateSelectToken(false, item);
                        }}
                      >
                        {item.name}
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
              <ModalFooter></ModalFooter>
            </ModalContent>
          </Modal>

          {/* Stake Sol Modal */}
          <Modal
            isOpen={isStakeSolOpen}
            onClose={onStakeSolClose}
            isKeyboardDismissDisabled={true}
            size="3xl"
          >
            <ModalContent>
              <ModalBody>
                <div
                  className="maincard"
                  style={{
                    minWidth: windowSize.width * 0.32,
                    display: siteConfig.isHeadless,
                  }}
                >
                  <Card
                    className=" bg-default-50 rounded-xl shadow-md px-3 w-full h-full"
                    style={{ width: "100%" }}
                  >
                    <CardBody className="py-5 gap-4">
                      <div className="flex gap-2.5 justify-center">
                        <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
                          <span className="text-default-900 text-xl font-semibold">
                            Stake Sol
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex flex-col gap-6 w-full"
                        style={{ minWidth: windowSize.width * 0.3 }}
                      >
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Image
                            alt="chain logo"
                            height={40}
                            src="/icon/sol.png"
                            width={40}
                          />

                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span className=" text-xs">Your Supply</span>
                            <span className="text-success">
                              {userSupply.your}
                            </span>
                          </div>

                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span className=" text-xs">Total Supply</span>
                            <span className="text-success">
                              {userSupply.total}
                            </span>
                          </div>

                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span className=" text-xs">Total Borrow</span>
                            <span className="text-success">
                              {(userBorrorwInformation / 1e9).toFixed(3)}
                            </span>
                          </div>

                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span className=" text-xs">Supply APY</span>
                            <span className="text-success">
                              {userStakeSolApy}%
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button
                            color="success"
                            onClick={onSupplyOpen}
                            style={{ width: "47%" }}
                          >
                            ➕ Supply
                          </Button>
                          <Button
                            color="danger"
                            onClick={onWithdrawOpen}
                            style={{ width: "47%" }}
                          >
                            ➖ Withdraw
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>

          <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full  ">
            <div
              className="inline-block max-w-xl text-center  py-2 md:py-4 justify-center"
              style={{ display: siteConfig.isHeadless }}
            >
              {windowSize.width > 500 ? null : (
                <a onClick={displayReferral}>[Referral]</a>
              )}
              &nbsp;&nbsp;&nbsp;
              {
              (windowSize.width < 500&&process.env.NEXT_PUBLIC_NETWORK == "devnet") ? 
              (
                <a onClick={displayFauct}>[Devnet Fauct]</a>
              )
              :null}
            </div>

            {
              <div
                className="inline-block max-w-xl text-center  py-2 md:py-4 justify-center"
                style={{ display: siteConfig.isHeadless }}
              >
                <Link
                  isExternal
                  href={siteConfig.links.twitter}
                  title="Twitter"
                >
                  <TwitterIcon className="text-default-500" />
                </Link>
                &nbsp; &nbsp;
                <Link
                  isExternal
                  href={siteConfig.links.discord}
                  title="Discord"
                >
                  <DiscordIcon className="text-default-500" />
                </Link>
                &nbsp; &nbsp;
                <Link
                  isExternal
                  href={siteConfig.links.telegramChannel}
                  title="Telegram"
                >
                  <div
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "24px",
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    <FaTelegram />
                  </div>
                </Link>
                &nbsp; &nbsp;
                <Link isExternal href={siteConfig.links.github} title="GitHub">
                  <GithubIcon className="text-default-500" />
                </Link>
              </div>
            }
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
