import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { FaTelegram, FaTwitter, FaDiscord } from "react-icons/fa";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
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

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Image } from "@nextui-org/image";

import WalletSelector from "@/components/WalletSelector";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Snippet,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { OKXUniversalProvider } from "@okxconnect/universal-provider";
import { OKXUniversalConnectUI } from "@okxconnect/ui";

import { globalWallet } from "@/core/wallet";

import { eventBus } from "@/core/events";
import { PublicKey } from "@solana/web3.js";

import { OKXSolanaProvider } from "@okxconnect/solana-provider";

import { twitterReferral, telegramShare } from "@/core/referral";
import { useRouter } from "next/router";
export const Navbar = () => {
  const { publicKey, connected, signTransaction, signMessage } = useWallet();

  const {
    isOpen: isAboutOpen,
    onOpen: onAboutOpen,
    onClose: onAboutClose,
  } = useDisclosure();
  const {
    isOpen: isRefOpen,
    onOpen: onRefOpen,
    onClose: onRefClose,
  } = useDisclosure();

  const {
    isOpen: isWalletConnectorOpen,
    onOpen: onWalletConnectorOpen,
    onClose: onWalletConnectorClose,
  } = useDisclosure();

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletConnectedType, setWalletConnectedType] = useState(0);
  const [walletConnectedAddress, setWalletConnectedAddress] = useState("");

  const confirmConnect = (types: any) => {
    if (isHomePageLive()) {
      eventBus.emit("confirm_connected", {
        type: types,
      });
    }
  };
  const walletChange = (e: any) => {
    globalWallet.type = e.type;
    switch (e.type) {
      case 0: //Wallet adapter wallet
        if (!e.data) {
          return false;
        }
        walletAdapterConnected(e.data);
        globalWallet.fn["signMsg"] = e.fn.signMessage;
        globalWallet.fn["signTxn"] = e.fn.signTransaction;
        globalWallet.address = new PublicKey(e.data);
        return confirmConnect(e.type);
        break;
      case 1: //OKX extension wallet
        okxExtensionWalletConnected();
        globalWallet.fn["provider"] = (window as any)?.okxwallet.solana;
        globalWallet.address = new PublicKey(
          (window as any)?.okxwallet.solana.publicKey.toString(),
        );
        return confirmConnect(e.type);
        break;
      case 2: //OKX uniwallet adapter
        let okxSolanaProvider = new OKXSolanaProvider(e.data);
        const add = okxSolanaProvider.getAccount();
        if (!add) {
          return false;
        }
        //console.log("OKX uni wallet ::", add);
        okxUniWalletConnected(add.address);
        globalWallet.fn["provider"] = okxSolanaProvider;
        globalWallet.address = new PublicKey(add?.address);
        return confirmConnect(e.type);
        break;
      default:
        return false;
    }
  };

  const okxUniWalletConnected = (address: string) => {
    setWalletConnected(true);
    setWalletConnectedType(2);
    setWalletConnectedAddress(address);
    onWalletConnectorClose();
  };
  const okxExtensionWalletConnected = () => {
    setWalletConnected(true);
    setWalletConnectedType(1);
    setWalletConnectedAddress(
      (window as any)?.okxwallet.solana.publicKey.toString(),
    );
    onWalletConnectorClose();
  };
  const walletAdapterConnected = (pk: PublicKey) => {
    setWalletConnected(true);
    setWalletConnectedType(0);
    setWalletConnectedAddress(pk.toBase58());
  };

  const router = useRouter();

  const isHomePageLive = () => {
    //console.log("🍺 isHomePageLive", router.pathname);
    if (router.pathname != "/") {
      return false;
    }
    return true;
  };

  useEffect(() => {
    setWalletConnected(true);
    //console.log("💣 Wallet status ::", globalWallet, walletConnected);
    if (connected && walletConnectedType == 0) {
      //console.log("Emit wallet adapter connection ::", connected, globalWallet);
      //Wallet adapter connected
      eventBus.emit("wallet_connected", {
        type: 0, //OKX wallet extension type
        data: publicKey,
        fn: {
          signMessage: signMessage,
          signTransaction: signTransaction,
        },
      });
    }
    if (!connected && walletConnectedType == 0) {
      //console.log("wallet_disconnected ");
      eventBus.emit("wallet_disconnected", {
        type: 0,
      });
    }
    eventBus.on("wallet_connected", async (e: any) => {
      //Wallet connect event check
      globalWallet.connected = true;
      if (e && e.detail) {
        walletChange(e.detail);
      } else {
        //console.log("Wallet connector error :: ", e);
      }
    });

    eventBus.on("wallet_disconnected", (e: any) => {
      disconnectWallet();
      globalWallet.connected = false;
    });

    eventBus.on("wallet_open", (e: any) => {
      onWalletConnectorOpen();
    });
    eventBus.on("display_how_it_works", (e: any) => {
      onAboutOpen();
    });
    eventBus.on("display_referral", (e: any) => {
      onRefOpen();
    });
    eventBus.on("display_fauct", (e: any) => {
      router.push("/faucet");
    });
    //console.log("Final wallet connect status ::", walletConnected);
  }, [connected, publicKey, walletConnectedType, walletConnected]);

  const walletBtn = () => {
    if (!walletConnected) {
      return (
        // <Button onClick={connectWallet} className="text-lg">  </Button>
        <a onClick={connectWallet}> [Connect Wallet] </a>
      );
    } else {
      if (walletConnectedType == 0) {
        //Wallet adapter
        return (
          <WalletMultiButton
            className="btn btn-ghost"
            style={{ height: "85%", backgroundColor: "green" }}
          />
        );
      } else {
        if (walletConnectedType == 1 || walletConnectedType == 2) {
          return (
            <Button startContent={<OkxIcon />} onClick={disconnectWallet}>
              {" "}
              {walletConnectedAddress.slice(0, 10)} ...
            </Button>
          );
        }

        if (walletConnectedType == 3) {
          return (
            <Button startContent={<UXUYIcon />} onClick={disconnectWallet}>
              {" "}
              {walletConnectedAddress.slice(0, 10)} ...
            </Button>
          );
        }
        if (walletConnectedType == 4) {
          return (
            <Button startContent={<TonspackIcon />} onClick={disconnectWallet}>
              {" "}
              {walletConnectedAddress.slice(0, 10)} ...
            </Button>
          );
        }
        return (
          <Button onClick={connectWallet}>
            {" "}
            {walletConnectedAddress.slice(0, 10)} ...
          </Button>
        );
      }
    }
  };

  const disconnectWallet = async () => {
    //console.log("Emite Disconnected");
    setWalletConnected(false);
    setWalletConnectedType(0);
    setWalletConnectedAddress("");
  };

  const connectWallet = async () => {
    onWalletConnectorOpen();
  };
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent justify="start" style={{ display: siteConfig.isHeadless }}>
        <NavbarBrand>
          <NextLink className="flex justify-start items-center gap-1" href="/">
            {/* <Logo />   */}
            <img
              alt="logo"
              src="/logo.png"
              className="logocolor"
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "transparent",
              }}
            />
            <p className="font-bold text-inherit text-sm md:text-sm">
              <span className={"github"}>Max Pump Coin&nbsp;</span>
            </p>
          </NextLink>
        </NavbarBrand>

        <div className="hidden lg:flex gap-4 justify-start ml-2">
          <NavbarItem>
            <div
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              onClick={onAboutOpen}
            >
              [How it works]
            </div>
            &nbsp;&nbsp;&nbsp;
            <div
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              onClick={onRefOpen}
            >
              [Referral]
            </div>
            {/* &nbsp;&nbsp;&nbsp;
              <div
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                onClick={
                  ()=>{
                    eventBus.emit("stake_modal_display", { 
                     
                     });
                  }
                }
              >
                [Stake SOL]
              </div> */}
            &nbsp;&nbsp;&nbsp;
            {
              (process.env.NEXT_PUBLIC_NETWORK == "devnet")?
              <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              href={"faucet"}
            >
              [Devnet Faucet]
            </NextLink>:null
            }
            
            <div
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              onClick={()=>{
                window.open("https://explorer.pumpmax.fun/")
              }}
            >
              [Explorer]
            </div>
            &nbsp;&nbsp;&nbsp;
            <div
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              onClick={()=>{
                window.open("https://docs.pumpmax.fun/")
              }}
            >
              [Docs]
            </div>

          </NavbarItem>

          {/* {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))} */}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
        style={{ display: siteConfig.isHeadless }}
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal href={siteConfig.links.twitter} title="Twitter">
            <TwitterIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} title="Discord">
            <DiscordIcon className="text-default-500" />
          </Link>
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
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-default-500" />
          </Link>
          {/* <ThemeSwitch /> */}
        </NavbarItem>
        {/* <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem> */}
        <NavbarItem className="hidden md:flex">
          {/* <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            
          </Button> */}

          {walletConnected ? walletBtn() : walletBtn()}
          {/* <WalletMultiButton className="btn btn-ghost" style={{height:"85%" , backgroundColor:"green"}} /> */}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent
        className="sm:hidden basis-1 pl-4"
        justify="end"
        style={{ display: siteConfig.isHeadless }}
      >
        {/* <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link> */}
        {/* <ThemeSwitch /> */}
        {/* <NavbarMenuToggle /> */}
        <div style={{ maxWidth: "100%" }}>
          {walletConnected ? walletBtn() : walletBtn()}
        </div>
      </NavbarContent>

      <NavbarMenu style={{ display: siteConfig.isHeadless }}>
        {/* {searchInput} */}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {/* {item.label} */}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
      {/* About Modal */}
      <Modal
        isOpen={isAboutOpen}
        onClose={onAboutClose}
        scrollBehavior={"inside"}
      >
        <ModalContent>
          <ModalHeader className="flex w-full">
            <div
              className="flex w-full justify-center items-center text-3xl"
              style={{ color: "green" }}
            >
              <Image alt="chain logo" height={50} src="/logo.png" width={50} />
              [How it works ?]
            </div>
          </ModalHeader>
          <ModalBody>
            <div className=" items-center justify-center  w-full">
              <p className="text-sm">
                &nbsp;&nbsp; Pumpmax: Maximize Pump coins easily by{" "}
                <a style={{ color: "orange" }}>buying</a>,{" "}
                <a style={{ color: "yellow" }}>borrowing</a>, and{" "}
                <a style={{ color: "pink" }}>earning</a> !A simple platform to
                boost Pump.fun user gains.
                <a className="text-lg" style={{ color: "gold" }}>
                  Start small, think big.
                </a>
              </p>
              <br />
              <div className="flex w-full justify-center items-center">
                <a className="text-xl" style={{ color: "green" }}>
                  Max Buy
                </a>
              </div>
              {/* <br /> */}
              <p className="text-sm">
                &nbsp;&nbsp; Step 1: Select a Pump coin you want to buy .
              </p>
              <br />
              <p className="text-sm">
                &nbsp;&nbsp; Step 2:Deposit SOL to get the max coins. Confirm to
                execute loop borrowing and finish buy.{" "}
              </p>
              <br />
              <p className="text-sm">
                &nbsp;&nbsp; Step 3:Click "Close" to exit the position and get
                SOL, or click "Repay" to pay interest and get coins.
              </p>
              <br />
              <div className="flex w-full justify-center items-center">
                <a className="text-xl" style={{ color: "green" }}>
                  Max Borrow
                </a>
              </div>
              {/* <br /> */}
              <p className="text-sm">
                &nbsp;&nbsp; Step 1: Select a Pump coin you want to use as
                collateral.
              </p>
              <br />
              <p className="text-sm">&nbsp;&nbsp; Step 2: Borrow out SOL.</p>
              <br />
              <p className="text-sm">
                &nbsp;&nbsp; Step 3: Click "Repay" to pay SOL and interest to
                redeem Pump coins. Click "Close" to sell coins and get SOL.
              </p>
              <br />
              <div className="flex w-full justify-center items-center">
                <a className="text-xl" style={{ color: "green" }}>
                  Stak SOL
                </a>
              </div>
              <p className="text-sm">
                &nbsp;&nbsp; Step1:Click “Supply" to deposit SOL and earn
                interest.
              </p>
              <br />{" "}
              <p className="text-sm">
                &nbsp;&nbsp; Step2:Click "Withdraw" to withdraw your SOL and
                interest.
              </p>
              <br></br>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Ref Modal */}
      <Modal
        isOpen={isRefOpen}
        onClose={onRefClose}
        scrollBehavior={"inside"}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="flex w-full">
            <div className="flex w-full justify-center items-center text-3xl">
              [Share & Referral]
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex w-full justify-center items-center">
              <Snippet color="success" symbol="">
                {publicKey
                  ? "https://PUMPMAX.fun/?referral=" + publicKey.toBase58()
                  : "https://PUMPMAX.fun/"}
              </Snippet>
            </div>
          </ModalBody>
          <ModalFooter>
            <div>
              <Button
                color="default"
                onClick={() => {
                  let add = "";
                  if (globalWallet.connected) {
                    add = globalWallet.address.toBase58();
                  }
                  twitterReferral(add);
                }}
              >
                <FaTwitter />
              </Button>
              <Button color="secondary">
                <FaDiscord />
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  let add = "";
                  if (globalWallet.connected) {
                    add = globalWallet.address.toBase58();
                  }
                  telegramShare(add);
                }}
              >
                <FaTelegram />
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Wallet Connector */}
      <Modal
        isOpen={isWalletConnectorOpen}
        onClose={onWalletConnectorClose}
        scrollBehavior={"inside"}
        placement={"center"}
        size="lg"
        style={{ maxHeight: "500px" }}
      >
        <ModalContent>
          <ModalHeader className="flex w-full">
            <div className="flex w-full justify-center items-center text-3xl">
              Connect Wallet
            </div>
          </ModalHeader>
          <ModalBody>
            <WalletSelector />
          </ModalBody>
        </ModalContent>
      </Modal>
    </NextUINavbar>
  );
};
