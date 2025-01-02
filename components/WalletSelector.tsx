import { Avatar } from "@nextui-org/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import {Input} from "@nextui-org/react"
import { Button, ButtonGroup } from "@nextui-org/button";
import { UXUYIcon,OkxIcon,PhantomIcon, SolflareIcon,TonspackIcon } from "@/components/icons";
export default function WalletSelector() {
  return (
    <div className="w-ful flex-col gap-20 p-4 rounded-2xl">
        <Button  startContent={<PhantomIcon />} endContent={<SolflareIcon/>} className="w-full text-xl">
        Solana Wallets
        </Button>
        &nbsp;
        <Button  startContent={<OkxIcon />} endContent={<OkxIcon/>} className="w-full text-xl">
        OKX Wallets
        </Button>
        &nbsp;
        <Button  startContent={<UXUYIcon />} endContent={<TonspackIcon/>} className="w-full text-xl">
        Telegram Wallets
        </Button>
    </div>
  );
}
