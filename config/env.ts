export const envConfig = {
  api: {
    shyft:
      "https://api.shyft.to/sol/v1/wallet/all_tokens?network=devnet&wallet=",
  },
  apiKey: {
    shyft: "AwM0UoO6r1w8XNOA",
  },
  rpc: "https://api.devnet.solana.com",
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
      pumpmaxProgramId :"3H39yWShVgHCTxfFbp3e2RdGmhcAW16CoNAMoeo4b2mx",
      pumpmaxVault:"zzntY4AtoZhQE8UnfUoiR4HKK2iv8wjW4fHVTCzKnn6"
    }
  }
};
