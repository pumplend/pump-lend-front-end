export const envConfig = {
  api: {
    shyft:
      `https://api.shyft.to/sol/v1/wallet/all_tokens?network=${process.env.NEXT_PUBLIC_NETWORK}&wallet=`,
  },
  apiKey: {
    shyft: "c6sQsEKeMhtSq6sp",
  },
  // rpc: "https://api.devnet.solana.com",
  rpc:process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  token: {
    defaultIcon: "https://pump.fun/logo.png",
  },
  env:"dev", //Dev or prod
  web3:{
    devnet:{
      pumpmaxProgramId :"3H39yWShVgHCTxfFbp3e2RdGmhcAW16CoNAMoeo4b2mx",
      pumpmaxVault:"zzntY4AtoZhQE8UnfUoiR4HKK2iv8wjW4fHVTCzKnn6"
    },
    mainnet:{
      pumpmaxProgramId :"41LsHyCYgo6VPuiFkk8q4n7VxJCkcuEBEX99hnCpt8Tk",
      pumpmaxVault:"FVRXRzHXtG1UDdrVfLPoSTKD44cwx99XKoWAqcQqeNb"
    }
  }
};
