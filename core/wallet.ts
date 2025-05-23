import { PublicKey, Transaction } from "@solana/web3.js";

let fn: any = {};
let globalWallet = {
  connected: false,
  type: 0,
  address: new PublicKey(0),
  fn: fn,
};

const signMsg = async (data: Uint8Array) => {
  switch (globalWallet.type) {
    case 0:
      if (globalWallet.fn.signMsg) {
        return globalWallet.fn.signMsg(data);
      }
      break;
    case 1:
    case 2:
      if (globalWallet.fn?.provider) {
        return globalWallet.fn.provider.signMessage(data);
      }
      break;
    default:
      return 0;
      return 0;
  }
};

const signTxn = async (data: Transaction) => {
  // console.log(data, globalWallet);
  switch (globalWallet.type) {
    case 0:
      if (globalWallet.fn?.signTxn) {
        return globalWallet.fn?.signTxn(data);
      } else {
        console.error("error can't find sign txn", globalWallet.fn?.signTxn);
      }
      break;
    case 1:
    case 2:
      if (globalWallet.fn?.provider) {
        return globalWallet.fn.provider.signTransaction(data);
      }
      break;
    default:
      return 0;
      return 0;
  }
};

export { globalWallet, signMsg, signTxn };
