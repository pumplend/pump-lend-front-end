import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Button } from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

import {
  pumpMintTest
} from "@/core/action"
import { globalWallet } from "@/core/wallet";

export default function FauctPage() {
  const { publicKey,connected ,signTransaction , signMessage } = useWallet();
  const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure();

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
            Devnet SOL Fauct
          </Link>
          <Button color="success" onClick = {onMintOpen}>
            Launch new token
          </Button>
        </div>

        <div className="flex gap-3">
        <Button>
            Buy
          </Button>
          <Button>
            Sell
          </Button>
        </div>



      <Modal isOpen={isMintOpen} onClose={onMintClose} scrollBehavior={"inside"} size="lg">
        <ModalContent>
          <ModalHeader className="flex w-full">
          <div className="flex w-full justify-center items-center text-3xl">
          Mint New Token
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              Hello World
            </div>
           <Button onClick={()=>{
            console.log(globalWallet)
            pumpMintTest(globalWallet.address,signTransaction)
           }}>
            Confirm
            </Button> 
          </ModalBody>
        </ModalContent>

      </Modal>
      </section>
    </DefaultLayout>
  );
}
