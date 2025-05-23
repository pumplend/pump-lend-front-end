import { PublicKey, Connection } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { envConfig } from "@/config/env";
import {
  fetchUserBorrowData,
  fetchPoolStakingData,
  fetchUserStakingData,
  fetchSystemConfigData,
} from "@/core/solanaData";
import {
  api_pump_lts_token,
  api_pump_search_token,
  api_pumpmax_get_user_positions,
} from "@/core/request";
import { Pumplend } from "@pumplend/pumplend-sdk";
// @ts-ignore
import BN from "bn.js";
const connection = new Connection(envConfig.rpc);

const programIdDefault = new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxProgramId)

let userTokens: false | [];

let userBorrowTokens: false | PublicKey[];
let userPumpTokens: false | [];

let systemConfig: PublicKey;
let poolStakingData: PublicKey;
let userStakingData: PublicKey;

let ltsPumpToken: any[] = [];
const lend = new Pumplend(
  process.env.NEXT_PUBLIC_NETWORK,
  new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxProgramId),
  undefined,
  new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxVault),
);
poolStakingData = PublicKey.findProgramAddressSync(
  [Buffer.from("pool_staking_data")],
  programIdDefault,
)[0];

const userTokenInit = async (publicKey: PublicKey) => {
  //Address init
  systemConfig = PublicKey.findProgramAddressSync(
    [Buffer.from("system_config")],
    programIdDefault,
  )[0];

  userStakingData = PublicKey.findProgramAddressSync(
    [Buffer.from("user_staking_data"), publicKey.toBuffer()],
    programIdDefault,
  )[0]; 

  const tks = await getUserTokenList(publicKey.toBase58());
  let tkss: any[];
  tkss = [];
  tks.forEach((element:any) => {
   
    if (element.address.includes("pump")) {
      tkss.push(element);
    }
  });
  // console.log("debugtks ::", tks,tkss);
  if (tks) {
    tkss.sort((a, b) => b.balance - a.balance);
    userTokens = JSON.parse(JSON.stringify(tkss))
  }
  await checkTokenExsitOrNot(publicKey);
  await checkTokenPumpOrNot(publicKey);
  return true;
};

const userSolStakeFetch = async (userAdd?: PublicKey) => {
  const pool = await lend.tryGetPoolStakingData(connection);

  let ret = {
    totalStaked: BigInt(0),
    totalShares: BigInt(0),
    totalBorrowed: BigInt(0),
    pendingVaultProfit: BigInt(0),
    userShares: BigInt(0),
  };
  if (pool) {
    ret.totalStaked = pool.totalStaked;
    ret.totalShares = pool.totalShares;
    ret.totalBorrowed = pool.totalBorrowed;
    ret.pendingVaultProfit = pool.pendingVaultProfit;
  }

  if(userAdd)
    {
      const user = await lend.tryGetUserStakingData(connection, userAdd);
      if (user) {
        ret.userShares = user.shares;
      }
    }
  // console.log("RAW stake inform ::",pool , connection,lend)
  return ret;
};

const userTokenBorrowFetch = async (publicKey: PublicKey, tks: any[]) => {
  let ret: any[];
  ret = [];
  let totalStake = 0;
  for (let i = 0; i < tks.length; i++) {
    try {
      const bda = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_borrow_data"),
          new PublicKey(tks[i].address).toBuffer(),
          publicKey.toBuffer(),
        ],
        programIdDefault,
      )[0];

      const bd = await lend.tryGetUserBorrowData(
        connection,

        new PublicKey(tks[i].address),
        publicKey,
      );
      // const bd = await fetchUserBorrowData(
      //   bda
      // )
      if (bd) {
        const retSeed = {
          token: tks[i].address,
          borrowedAmount: bd.borrowedAmount,
          depositSolAmount: bd.depositSolAmount,
          collateralAmount: bd.collateralAmount,
          referrer: bd.referrer,
          lastUpdated: bd.lastUpdated,
        };
        ret.push(retSeed);
        totalStake += Number(bd.borrowedAmount);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return {
    tokenData: ret,
    totalStake,
  };
};

async function getUserTokenList(address: string) {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", envConfig.apiKey.shyft);

  const tokenResponse = await fetch(envConfig.api.shyft + address, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });
  return (await tokenResponse.json()).result;
}

async function checkTokenExsitOrNot(publicKey: PublicKey) {
  //New solution . using explorer

  if (!userTokens) {
    return 0;
  }
  const position = await api_pumpmax_get_user_positions(
    1,
    10,
    publicKey.toBase58(),
  );

  if (position && position?.data) {
    let r: PublicKey[];
    r = [];
    let tmpT = JSON.parse(JSON.stringify(userTokens));
    position.data.forEach((e: any) => {
      for (let i = 0; i < tmpT.length; i++) {
        if (e.token == tmpT[i].address) {
          r.push(tmpT[i]);
        }
      }
    });
    userBorrowTokens = r;
  }
  // console.log("🚀 checkTokenExsitOrNot", userBorrowTokens,
  //   JSON.parse(JSON.stringify(userTokens))
  // );
  return 0;
  // Old solution . loop again and agin
  // let ret :any[];
  // ret = [];
  // if(!userTokens)
  // {
  //   return false;
  // }
  // for(let i = 0 ; i<userTokens.length ; i ++)
  // {
  //   try{
  //     const borrowAddress = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("user_borrow_data"),
  //         new PublicKey(
  //           JSON.parse(
  //             JSON.stringify(
  //               userTokens[i]
  //             )
  //           ).address
  //         ).toBuffer(),
  //         publicKey.toBuffer()
  //       ],
  //       programIdDefault
  //     )[0];

  //     const accountInfo = await connection.getAccountInfo(
  //       borrowAddress

  //     );

  //     if (!accountInfo) {
  //       console.log("✈Token not found",JSON.parse(
  //         JSON.stringify(
  //           userTokens[i]
  //         )
  //       ).address)
  //       throw new Error("Account not found");
  //     }else{
  //       console.log("✈Token found",accountInfo,JSON.parse(
  //         JSON.stringify(
  //           userTokens[i]
  //         )
  //       ).address)
  //       ret.push(
  //         userTokens[i]
  //       )
  //     }

  //   }catch(e)
  //   {
  //     console.error(e)
  //   }

  // }

  // if(ret.length>0)
  //   {
  //     console.log("✈ Final stake tokens :: ",ret)
  //     userBorrowTokens = JSON.parse(
  //       JSON.stringify(ret)
  //     );
  //   }
}

async function checkTokenPumpOrNot(publicKey: PublicKey) {
  //Ignore
  try{
    userPumpTokens = JSON.parse(JSON.stringify(userTokens));
    return 0;
  }catch(e)
  {
    userPumpTokens = []
  }

  //Do not check
  // let ret :any[];
  // ret = [];
  // if(!userTokens)
  // {
  //   return false;
  // }
  // for(let i = 0 ; i<userTokens.length ; i ++)
  // {
  //   try{
  //       let [bondingCurve] = PublicKey.findProgramAddressSync(
  //         [
  //             Buffer.from("bonding-curve"),
  //             new PublicKey(
  //               JSON.parse(
  //                 JSON.stringify(
  //                   userTokens[i]
  //                 )
  //               ).address
  //             ).toBuffer(),
  //         ],
  //         pumpKeyAccount
  //     );
  //     const accountInfo = await connection.getAccountInfo(
  //       bondingCurve

  //     );

  //     if (!accountInfo) {
  //       console.log("✈Token not found",JSON.parse(
  //         JSON.stringify(
  //           userTokens[i]
  //         )
  //       ).address)
  //       throw new Error("Account not found");
  //     }else{
  //       console.log("✈Token found",accountInfo,JSON.parse(
  //         JSON.stringify(
  //           userTokens[i]
  //         )
  //       ).address)
  //       ret.push(
  //         userTokens[i]
  //       )
  //     }

  //   }catch(e)
  //   {
  //     console.error(e)
  //   }

  // }

  // if(ret.length>0)
  //   {
  //     console.log("✈ Final stake tokens :: ",ret)
  //     userPumpTokens = JSON.parse(
  //       JSON.stringify(ret)
  //     );
  //   }
}
const getTokenBalance = async (
  tokenAddress: PublicKey,
  walletAddress: PublicKey,
) => {
  try {
    const accountInfo = await getAccount(connection, tokenAddress);
    return accountInfo.amount.toString();
  } catch (error) {
    console.error("Failed to get token balance:", error);
    return null;
  }
};
const getAddressBalance = async (address: PublicKey) => {
  return await connection.getBalance(address);
};
const getPumpLtsTokenList = async (list = 10) => {
  const data = await api_pump_lts_token(list);
  // console.log("💊 LTS pump token ::", data);
  if (!data) {
    return [];
  } else {
    return data;
  }
};
const getPumpLtsTokenSearch = async (searchdata: string) => {
  const data = await api_pump_search_token(searchdata, 10);
  // console.log("💊 LTS pump token ::", data);
  if (!data) {
    return [];
  } else {
    return data;
  }
};

const ifRaydium  = async (token:PublicKey) =>
{
  const curve = await lend.tryGetPumpTokenCurveData(connection,token)
  if(curve && curve.complete == BigInt(1))
    {
      return true;
    }else{
      return false;
    }
}

export {
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
  ltsPumpToken,
  ifRaydium
};
