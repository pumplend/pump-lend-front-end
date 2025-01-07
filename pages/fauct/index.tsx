import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Button, Input } from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

import {
  pumpMintAndBuy
} from "@/core/action"
import { globalWallet } from "@/core/wallet";
import { eventBus } from "@/core/events";
export default function FauctPage() {
  const { publicKey,connected ,signTransaction , signMessage } = useWallet();
  const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
  const [buyAmount, setBuyAmount] = useState("0")
    const openWalletModal = ()=>{
      eventBus.emit("wallet_open", { 
        
       });
    }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Devnet&nbsp;</span>
          <span className={title({ color: "violet" })}>Fauct&nbsp;</span>
          <div className={subtitle({ class: "mt-4" })}>
            You can deploy new pump token or buy/sell via devnet.
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "secondary",
              radius: "full",
              variant: "shadow",
            })}
            href={"https://faucet.solana.com/"}
          >
            ① Devnet SOL Fauct
          </Link>
          <Button color="success" onClick = {onMintOpen}>
            ② Buy Test Token
          </Button>
        </div>

        {/* <div className="flex gap-3">
        <Button>
            Buy
          </Button>
          <Button>
            Sell
          </Button>
        </div> */}



      <Modal isOpen={isMintOpen} onClose={onMintClose} scrollBehavior={"inside"} size="lg">
        <ModalContent>
          <ModalHeader className="flex w-full">
          <div className="flex w-full justify-center items-center text-3xl">
          Buy New Token
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              Random buy a new token in pump . How much you want : 
            </div>
            {/* <Input
            onChange={
              (e:any)=>{
                setBuyAmount(e.currentTarget.value)
              }
            }
            type="number"
            placeholder="Input the token amount you wants to buy , 20000000 ."
            >
            
            </Input> */}
           <Button onClick={async ()=>{
            if(globalWallet.connected)
            {
              await pumpMintAndBuy(globalWallet.address,Number(10000000));
              onMintClose()
              onSuccessOpen()
            }else{
              openWalletModal()
            }

           }}>
            10M
            </Button> 
            <Button onClick={async ()=>{
            if(globalWallet.connected)
            {
              await pumpMintAndBuy(globalWallet.address,Number(20000000));
              onMintClose()
              onSuccessOpen()
            }else{
              openWalletModal()
            }

           }}>
            20M
            </Button> 
            <Button onClick={async ()=>{
            if(globalWallet.connected)
            {
              await pumpMintAndBuy(globalWallet.address,Number(30000000));
              onMintClose()
              onSuccessOpen()
            }else{
              openWalletModal()
            }

           }}>
            30M
            </Button> 
            
          </ModalBody>
        </ModalContent>

      </Modal>


      <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} scrollBehavior={"inside"} size="lg">
        <ModalContent>
          <ModalHeader className="flex w-full">
          <div className="flex w-full justify-center items-center text-3xl">
          Transaction Pending...
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              Now please wait for 2 minute and your will recive the token in your wallet .
            </div>
          </ModalBody>
        </ModalContent>

      </Modal>
      </section>
    </DefaultLayout>
  );
}
