import { Avatar } from "@nextui-org/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import {Input} from "@nextui-org/react"
import { Button, ButtonGroup } from "@nextui-org/button";
import { UXUYIcon,OkxIcon,PhantomIcon, SolflareIcon,TonspackIcon } from "@/components/icons";


import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { OKXUniversalConnectUI } from "@okxconnect/ui";

// import { WalletTgSdk } from '@uxuycom/web3-tg-sdk';
import { eventBus } from "@/core/events";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Snippet
} from "@nextui-org/react";
import { OKXSolanaProvider } from "@okxconnect/solana-provider";
export default function WalletSelector() {
  const { setVisible } = useWalletModal();
  const { isOpen: isTgopen, onOpen: onTgOpen, onClose: onTgClose } = useDisclosure();
  
  const okxWalletConnect = async ()=>{
    
      if(!(window as any)?.okxwallet)
      {
        const w = OKXUniversalConnectUI.getWallets()
        console.log("OKX wallet ::",w)
        const universalUi = await OKXUniversalConnectUI.init({
          dappMetaData: {
              icon: "https://pumplend.fun/logo.png",
              name: "PUMPLEND"
          },
          actionsConfiguration: {
              returnStrategy: 'tg://resolve',
              modals:"all",
              tmaReturnUrl:'back'
          },
          language: "en_US",
      });
    
      var session = await universalUi.openModal({
        namespaces: {
            solana: {
                chains: [
                "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // solana mainnet
                // "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",// solana testnet
                //  "sonic:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",// sonic testnet
                ],
            }
        }
    })
    const status = universalUi.connected();
    if(status)
    {
      eventBus.emit("wallet_connected", { 
        type : 2 , //OKX UNI wallet extension type
        data : universalUi
       });
    }


      }else{
       
        try{
          (window as any)?.okxwallet.solana.disconnect()
          (window as any)?.okxwallet.solana.on(
            "connect", () => {
              eventBus.emit("wallet_connected", { 
                type : 1 , //OKX wallet extension type
                data : (window as any)?.okxwallet.solana
               });
            }
          );
        }catch(e)
        {e}
        
        (window as any)?.okxwallet.solana.connect()
      }
      }


    const UXUYWalletConnec = async ()=>
    {
      window.alert("We are working on it .")
      // const { solana } = new WalletTgSdk({
      //     metaData: {
      //         icon: "https://pumplend.fun/logo.png",
      //         name: "PUMPLEND",
      //         hostname: "PUMPLEND"
      //     }
      // });

      // await solana.connect(
      //   {onlyIfTrusted:false},false
      // );
    }

    const TelegramWallets = ()=> {
      return (
        <div className="w-ful flex-col gap-20 p-4 rounded-2xl">
        <Button  startContent={<UXUYIcon />}  className="w-full text-xl" onClick={()=>{
          UXUYWalletConnec()
        }}>
        UXUY Wallet
        </Button>
        &nbsp;
        <Button  startContent={<OkxIcon />} className="w-full text-xl" onClick={async ()=>{
          await okxWalletConnect()
        }}>
        OKX Wallets
        </Button>
        &nbsp;
        <Button  startContent={<TonspackIcon />}  className="w-full text-xl" onClick={()=>{
          window.alert("We are working on it .")
        }}>
        Tonspack Wallets
        </Button>
        </div>
      )
    }

  return (

    <div className="w-ful flex-col gap-20 p-4 rounded-2xl">
        <Button  startContent={<PhantomIcon />} endContent={<SolflareIcon/>} className="w-full text-xl" onClick={()=>{
          setVisible(true)
        }}>
        Extension Wallets
        </Button>
        &nbsp;
        <Button  startContent={<OkxIcon />} endContent={<OkxIcon/>} className="w-full text-xl" onClick={async ()=>{
          await okxWalletConnect()
        }}>
        OKX Wallets
        </Button>
        &nbsp;
        <Button  startContent={<UXUYIcon />} endContent={<TonspackIcon/>} className="w-full text-xl" onClick={()=>{
          onTgOpen()
        }}>
        Telegram Wallets
        </Button>





      <Modal isOpen={isTgopen} onClose={onTgClose} scrollBehavior={"inside"} size="lg">
        <ModalContent>
          <ModalHeader className="flex w-full">
          <div className="flex w-full justify-center items-center text-3xl">
          Connect Telegram Wallet
            </div>
          </ModalHeader>
          <ModalBody>
            {
              TelegramWallets()
            }
          </ModalBody>
        </ModalContent> 

      </Modal>


    </div>
  );
}
