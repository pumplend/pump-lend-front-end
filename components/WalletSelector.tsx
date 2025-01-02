import { Avatar } from "@nextui-org/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import {Input} from "@nextui-org/react"
import { Button, ButtonGroup } from "@nextui-org/button";
import { UXUYIcon,OkxIcon,PhantomIcon, SolflareIcon,TonspackIcon } from "@/components/icons";


import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletSelector() {

  const { setVisible } = useWalletModal();

  
  const okxWalletConnect = async ()=>{
      if(!window.okxwallet)
      {
  
        const universalUi = await OKXUniversalConnectUI.init({
          dappMetaData: {
              icon: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
              name: "OKX Connect Demo"
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
                //  "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",// solana testnet
                //  "sonic:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",// sonic testnet
                ],
            }
        }
    })
      }else{
        console.log( "🍺 Browser okx wallet ::",window.okxwallet ,window.okxwallet.solana )
        window.okxwallet.solana.disconnect()
        window.okxwallet.solana.connect()
        
      }
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
        <Button  startContent={<UXUYIcon />} endContent={<TonspackIcon/>} className="w-full text-xl">
        Telegram Wallets
        </Button>
    </div>
  );
}
