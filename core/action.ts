import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Connection,
  clusterApiUrl,
  TransactionInstruction,
  Struct,
  ComputeBudgetProgram,
  SendTransactionError,
} from "@solana/web3.js";
import {
  mintTo,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  getMintLen,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import {
  getPoolsForToken
} from "@pumplend/raydium-js-sdk"
import { Pumplend } from "@pumplend/pumplend-sdk";

import { globalWallet, signTxn } from "@/core/wallet";
// @ts-ignore
import BN from "bn.js";
import * as abi from "@/core/pump_lend.json";
import { serialize, Schema, deserialize, deserializeUnchecked } from "borsh";
import { createHash } from "crypto";
import { envConfig } from "@/config/env";
const programIdDefault = new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxProgramId)

const lend = new Pumplend(
  process.env.NEXT_PUBLIC_NETWORK,
  new PublicKey(JSON.parse(JSON.stringify(envConfig.web3))[String(process.env.NEXT_PUBLIC_NETWORK)].pumpmaxProgramId)
);

// PDA Accounts
let systemConfig: PublicKey;
let poolTokenAuthority: PublicKey;
let poolStakingData: PublicKey;
let userStakingData: PublicKey;
let userBorrowData: PublicKey;

let tokenMint: PublicKey = new PublicKey(0);
let userTokenAccount: PublicKey;
let poolTokenAccount: PublicKey;

let pumpKeyAccount = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
);

const connection = new Connection(envConfig.rpc);

const addressBooks = (
  publicKey: PublicKey,
  token: string = tokenMint.toBase58(),
) => {
  tokenMint = new PublicKey(token);
  if (!publicKey) {
    return false;
  }
  systemConfig = PublicKey.findProgramAddressSync(
    [Buffer.from("system_config")],
    programIdDefault,
  )[0];

  poolStakingData = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_staking_data")],
    programIdDefault,
  )[0];

  userStakingData = PublicKey.findProgramAddressSync(
    [Buffer.from("user_staking_data"), publicKey.toBuffer()],
    programIdDefault,
  )[0];

  userBorrowData = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user_borrow_data"),
      tokenMint.toBuffer(),
      publicKey.toBuffer(),
    ],
    programIdDefault,
  )[0];
  userTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey, true);

  poolTokenAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_token_authority")],
    programIdDefault,
  )[0];
  poolTokenAccount = getAssociatedTokenAddressSync(
    tokenMint,
    poolTokenAuthority,
    true,
  );

  return {
    systemConfig,
    poolStakingData,
    userStakingData,
    userBorrowData,
    userTokenAccount,
    poolTokenAuthority,
    poolTokenAccount,
  };
};

/**
 * Staking function
 */
const userStakeSol = async (amount: number, publicKey: PublicKey) => {
  const tx = await lend.stake(amount * LAMPORTS_PER_SOL, publicKey, publicKey);
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);
  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

const userWithdrawSol = async (amount: number, publicKey: PublicKey) => {
  const tx = await lend.withdraw(amount, publicKey, publicKey);
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

/**
 * Borrow & repay
 *
 *
 */

const userBorrowToken = async (
  amount: number,
  publicKey: PublicKey,
  token: PublicKey,
) => {
  const tx = await lend.borrow(amount * 1e6, token, publicKey, publicKey);
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);
  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

const userRepayToken = async (publicKey: PublicKey, token: PublicKey) => {
  const tx = await lend.repay(0, token, publicKey, publicKey);
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);
  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

/**
 * Leverage & Close
 *
 * Both pump.close raydium.close
 */

const userLeverageTokenPump = async (
  amount: number,
  publicKey: PublicKey,
  token: PublicKey,
) => {
  console.log("amount ::", amount * LAMPORTS_PER_SOL);
  const tx = await lend.leverage_pump(
    amount * LAMPORTS_PER_SOL,
    token,
    publicKey,
    publicKey,
  );
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

const userLeverageTokenRaydium = async (
  amount: number,
  publicKey: PublicKey,
  token: PublicKey,
) => {
  console.log("amount ::", amount * LAMPORTS_PER_SOL);
  const tx = await lend.leverage_raydium(
    connection,
    amount * LAMPORTS_PER_SOL,
    token,
    publicKey,
    publicKey,
  );
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};


const userCloseTokenPump = async (publicKey: PublicKey, token: PublicKey) => {
  const tx = await lend.close_pump(token, publicKey, publicKey);
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

const userCloseTokenRaydium = async (publicKey: PublicKey, token: PublicKey) => {
  const pools = await getPoolsForToken(token)
  if(!pools || pools.length == 0 )
  {
    console.log("No pools found")
    return false;
  }
  const tx = await lend.close_raydium(connection,token,pools[0], publicKey);
  if (!tx) {
    console.error("Transaction generated failed:");
    return false;
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signedTransaction = await signTxn(tx);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

/**
 * Tools function
 */

async function createTokenMint(
  connection: any,
  payer: any,
  token_program_id: any,
) {
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  const mintLen = getMintLen([]);
  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(mintLen);
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintLamports,
      programId: token_program_id,
    }),
    createInitializeMintInstruction(
      mint,
      9,
      payer.publicKey,
      null,
      token_program_id,
    ),
  );
  await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [payer, mintKeypair],
    undefined,
  );

  return mint;
}

class PumpBuyArgs extends Struct {
  amount: BN;
  maxSolCost: BN;
  constructor(fields: { amount: BN; maxSolCost: BN }) {
    super(fields);
    this.amount = fields.amount;
    this.maxSolCost = fields.maxSolCost;
  }
}
const PumpBuyArgsSchema = new Map([
  [
    PumpBuyArgs,
    {
      kind: "struct",
      fields: [
        ["amount", "u64"],
        ["maxSolCost", "u64"],
      ],
    },
  ],
]);

const pumpBuyTest = async (
  publicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
) => {
  const mint = new PublicKey("Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd");
  const pp = await fetchPumpData(mint);
  const feeRecipient = pp.feeRecipient;
  const bondingCurve = pp.bondingCurve;
  const associatedBondingCurve = pp.associatedBondingCurve;
  const global = pp.global;
  const user = publicKey;
  const systemProgram = new PublicKey("11111111111111111111111111111111");
  const tokenProgram = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  );
  const rent = pp.rent;
  const eventAuthority = pp.eventAuthority;
  const program = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
  const args = new PumpBuyArgs({
    amount: new BN(413786),
    maxSolCost: new BN(30 * 1e9),
  });
  const buyBuffer = serialize(PumpBuyArgsSchema, args);
  // const args = new StakeArgs({ amount:new BN( 1*1e9) });
  // const buyBuffer = serialize(StakeArgsSchema, args);

  const associatedUser = getAssociatedTokenAddressSync(mint, publicKey);
  // const accountGenrateTx = createAssociatedTokenAccountInstruction(publicKey,associatedUser,publicKey,mint)
  const data = Buffer.concat([
    new Uint8Array(sighash("global", "buy")),
    buyBuffer,
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: global, isSigner: false, isWritable: true },
      { pubkey: feeRecipient, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedUser, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: true },
      { pubkey: rent, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: false, isWritable: true },
      { pubkey: program, isSigner: false, isWritable: true },
    ],
    programId: program,
    data: data,
  });

  const transaction = new Transaction();
  try {
    const getAccountPDA = await getAccount(connection, associatedUser);
    if (!getAccountPDA) {
      throw "token PDA not init";
    } else {
      console.log("Account already init ::", getAccountPDA);
    }
  } catch (e) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        associatedUser,
        publicKey,
        mint,
      ),
    );
  }
  transaction.add(instruction);
  transaction.feePayer = publicKey;

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  console.log("🚀 final txn :: ", transaction);
  const signedTransaction = await signTransaction(transaction);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

const pumpSellTest = async (
  publicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
) => {
  const mint = new PublicKey("Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd");
  const pp = await fetchPumpData(mint);
  const feeRecipient = pp.feeRecipient;
  const bondingCurve = pp.bondingCurve;
  const associatedBondingCurve = pp.associatedBondingCurve;
  const global = pp.global;
  const user = publicKey;
  const systemProgram = new PublicKey("11111111111111111111111111111111");
  const tokenProgram = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  );
  const associatedTokenProgram = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  );
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
  );
  const program = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
  const args = new PumpBuyArgs({
    amount: new BN(10000000 * 1e6),
    maxSolCost: new BN(0),
  });
  const buyBuffer = serialize(PumpBuyArgsSchema, args);
  // const args = new StakeArgs({ amount:new BN( 1*1e9) });
  // const buyBuffer = serialize(StakeArgsSchema, args);

  const associatedUser = getAssociatedTokenAddressSync(mint, publicKey);
  // const accountGenrateTx = createAssociatedTokenAccountInstruction(publicKey,associatedUser,publicKey,mint)
  const data = Buffer.concat([
    new Uint8Array(sighash("global", "sell")),
    buyBuffer,
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: global, isSigner: false, isWritable: true },
      { pubkey: feeRecipient, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedUser, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: true },
      { pubkey: associatedTokenProgram, isSigner: false, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: false, isWritable: true },
      { pubkey: program, isSigner: false, isWritable: true },
    ],
    programId: program,
    data: data,
  });

  const transaction = new Transaction();

  try {
    const getAccountPDA = await getAccount(connection, associatedUser);
    if (!getAccountPDA) {
      throw "token PDA not init";
    } else {
      console.log("Account already init ::", getAccountPDA);
    }
  } catch (e) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        associatedUser,
        publicKey,
        mint,
      ),
    );
  }
  transaction.add(instruction);
  transaction.feePayer = publicKey;

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  console.log("🚀 final txn :: ", transaction);
  const signedTransaction = await signTransaction(transaction);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
};

class PumpMintArgs extends Struct {
  name: string;
  symbol: string;
  uri: string;

  constructor(fields: { name: string; symbol: string; uri: string }) {
    super(fields);
    this.name = fields.name;
    this.symbol = fields.symbol;
    this.uri = fields.uri;
  }
}

const PumpMintArgsSchema = new Map([
  [
    PumpMintArgs,
    {
      kind: "struct",
      fields: [
        ["name", "string"],
        ["symbol", "string"],
        ["uri", "string"],
      ],
    },
  ],
]);
const pumpMintTest = async (publicKey: PublicKey) => {
  const args = {
    name: "PUMPLENDTEST💊",
    symbol: "PLT",
    uri: "https://ipfs.io/ipfs/QmTMacXhTKiPAeJkEUKrTmw74SMB4gYfmUsaej7KpfLj7w",
  };
  const MPL_TOKEN_METADATA = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );
  const token_mint_authority = new PublicKey(
    "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM",
  );

  const GLOBAL = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");

  const mint_account = Keypair.generate();
  let [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint_account.publicKey.toBuffer()],
    pumpKeyAccount,
  );
  let [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [
      bondingCurve.toBuffer(),
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
      mint_account.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  // const bonding_curve = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
  let [metadata, metadataBump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA.toBuffer(),
      mint_account.publicKey.toBuffer(),
    ],
    MPL_TOKEN_METADATA,
  );

  const feeRecipient = new PublicKey(
    "68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg",
  );
  const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
  );

  const mint = mint_account.publicKey;
  const mintAuthority = token_mint_authority;
  const mplTokenMetadata = MPL_TOKEN_METADATA;
  const user = publicKey;
  const systemProgram = SystemProgram.programId;
  const tokenProgram = TOKEN_PROGRAM_ID;
  const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
  const program = pumpKeyAccount;
  const argss = new PumpMintArgs(args);
  const dataBuffer = serialize(PumpMintArgsSchema, argss);

  const createBuffer = Buffer.concat([
    new Uint8Array(sighash("global", "create")),
    dataBuffer,
  ]);

  console.log({
    keys: [
      { pubkey: mint.toBase58(), isSigner: true, isWritable: false },
      { pubkey: mintAuthority.toBase58(), isSigner: false, isWritable: true },
      { pubkey: bondingCurve.toBase58(), isSigner: false, isWritable: false },
      {
        pubkey: associatedBondingCurve.toBase58(),
        isSigner: false,
        isWritable: false,
      },
      { pubkey: global.toBase58(), isSigner: false, isWritable: false },
      {
        pubkey: mplTokenMetadata.toBase58(),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: metadata.toBase58(), isSigner: false, isWritable: true },
      { pubkey: user.toBase58(), isSigner: true, isWritable: false },
      { pubkey: systemProgram.toBase58(), isSigner: false, isWritable: true },
      { pubkey: tokenProgram.toBase58(), isSigner: false, isWritable: true },
      {
        pubkey: associatedTokenProgram.toBase58(),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: rent.toBase58(), isSigner: false, isWritable: true },
      { pubkey: eventAuthority.toBase58(), isSigner: false, isWritable: true },
      { pubkey: program.toBase58(), isSigner: false, isWritable: true },
    ],
    programId: program,
    data: createBuffer,
  });
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: mint, isSigner: true, isWritable: true },
      { pubkey: mintAuthority, isSigner: false, isWritable: false },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: global, isSigner: false, isWritable: false },
      { pubkey: mplTokenMetadata, isSigner: false, isWritable: false },
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: associatedTokenProgram, isSigner: false, isWritable: false },
      { pubkey: rent, isSigner: false, isWritable: false },
      { pubkey: eventAuthority, isSigner: false, isWritable: false },
      { pubkey: program, isSigner: false, isWritable: false },
    ],
    programId: program,
    data: createBuffer,
  });
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.feePayer = publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.partialSign(mint_account);
  let signedTransaction = await signTxn(transaction);

  console.log(signedTransaction);
  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    return mint_account.publicKey.toBase58();
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
    return false;
  }
};

function getRandomName(length: number) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    result += letters[randomIndex];
  }
  return result;
}

function getRandomLink() {
  const link = [
    "https://ipfs.io/ipfs/QmagMxJhsHDPspJwFYJLdKbwYBjc9A2okhpuBYERKXsqSY",
    "https://ipfs.io/ipfs/QmNcpcWrkdCYZEzxzRui6UZigWdU6GQNyvpYzdbwxTXunM",
    "https://ipfs.io/ipfs/QmP82XXiHtq19zic7ket9jWKkfM6jkuzgAHjRQqVM5yc9g",
    "https://ipfs.io/ipfs/QmYYVKmVkRD8wBVKQEmuX39h6ot38sAtunwCw6viHJ3mZg",
    "https://ipfs.io/ipfs/QmRbrPJ1gEgqkaPSJ1XkUiDg5GDB3BUxqzQdqKbGkXsiLM",
    "https://ipfs.io/ipfs/QmQJPaRVjCy5MrakQ1KJ37xLEorzsjTBEfBNNLRNT9hgoZ",
    "https://ipfs.io/ipfs/QmdApSzY7GchoH4o23BKSDW7hz17XJwZnwdNNJ27jaUm7U",
    "https://ipfs.io/ipfs/QmQE3sag4hPSSLt98CHMb3e6wfU8iJU22nD9BMPigN4kgE",
    "https://ipfs.io/ipfs/QmVEN6PQ5B641UjdppRaSUBfNthjPfjTL8pRvGSiU6LYGM",
    "https://ipfs.io/ipfs/QmU4Xk5zqWm6H9R5ypgVqtAxGaUMVXh6ryV6qvSU5Hzy9J",
    "https://ipfs.io/ipfs/QmNp8H4WeYfP4GLkDjJo4zQ8qvxuLV49aTL4oKRXGommtU",
    "https://ipfs.io/ipfs/QmVasX6ZL236rUwNqiKMMCaqgrZKJucQ2CXKtwYTjYasw6",
    "https://ipfs.io/ipfs/QmcmMitxrSj8UcVuyr6nybdqekruUY8bdbUv6MQF5B7x8K",
    "https://ipfs.io/ipfs/QmSaSpS4wteRPcCeAZ4uMGC1iJe1h6nV484UHSvRGrB1AW",
    "https://ipfs.io/ipfs/QmT11TH6JkihHUjUDuCPXErF1jPd31rjWhwQBepR9PJkja",
    "https://ipfs.io/ipfs/QmYEMR9AVpTRtuEM7XnzGJNjATFkxTQVayTYkLW6RMCpkA",
    "https://ipfs.io/ipfs/QmSGFCbW94QLMiy5Bhzs9brxosk7mmJNT3jxHgpagtomVC",
    "https://ipfs.io/ipfs/QmawSiu2YzCsWQZh5bmFMJjgzNWwpFGnDPySQRdiU8pDAV",
    "https://ipfs.io/ipfs/Qmcvt7GLmrbDi6Yat8tY72HdGf5FRDRF6AShwicPF147rn",
    "https://ipfs.io/ipfs/QmNMPRpwjxgkAyH8fx3mWtxXHXEbwHfJAMyUFHt94MxPV8",
    "https://ipfs.io/ipfs/QmbcpJSiuVGPL6tdJmRXx2crRFzvcPYArVrB71C5Xzuzmk",
    "https://ipfs.io/ipfs/QmdM3VjYTtMiGx3h4tJJVcBaWnpAqvTu3yLhkXvr1CGhhL",
    "https://ipfs.io/ipfs/QmWH4BTdaDq8nTmnuR5hH6jKgJQz9XHgohaXNCtD3Eadup",
    "https://ipfs.io/ipfs/QmXifMdLh5BS49txJ6Jvafh5Hqt3r5eyRXwKKA9Vnj2CJx",
    "https://ipfs.io/ipfs/QmSz6xuQQBox6zmUThKaHabCd2ngThs4kTDtF2wc51rxeL",
    "https://ipfs.io/ipfs/QmePw8zpYgBXgifmin6JHb1H3MykV8xSB5wM2n1nN24ZCb",
    "https://ipfs.io/ipfs/QmZ6SfuCSku46F7zyEPfX2HghS4ozvsFh9bhidA6mnQGUV",
    "https://ipfs.io/ipfs/QmWB9tw77C5H8xnVZdh4edDZ5rLHKMQgRKry8i1dwsS7PM",
    "https://ipfs.io/ipfs/QmNSG6yCM2vmg32S54chYUqdNbt515riZxDstiTG8JVCV9",
    "https://ipfs.io/ipfs/QmYHZgBwwYiMB1j3Q2AVxDWBQCRMSLHkoAvLUox1eExkGB",
    "https://ipfs.io/ipfs/QmXHyJorSpHacsUV3Xk19C6v5u3KYedUjXKFzyjqppspJL",
    "https://ipfs.io/ipfs/QmRQc35Zg4infnh5VKvsTq7jJB1Ki2GK3TRWQCvB7Es3e4",
    "https://ipfs.io/ipfs/QmYuEK2S5chVM6WwF4ntyJeS4NFTvFykgFeHwnQHuk7yeh",
    "https://ipfs.io/ipfs/Qmb6iUf8vKkG69GWF8cLs9bpvR4126mJxGV3vLLks8Gvnj",
    "https://ipfs.io/ipfs/QmNrQ58cxJ2NzTNrGVS1NCWGK3qooctrt4RymegYuat34a",
    "https://ipfs.io/ipfs/QmTsyuKTQErPsBhq5UXAvKTqr1LaYXFh3rDnbdKjBaNgfP",
    "https://gateway.irys.xyz/Yc33iz06ZPAwUQfECIIilsikxrRnAPK7L1We62R90qw",
    "https://ipfs.io/ipfs/QmWgxfmxE5mtXkBSg1uAzj4JLoiZSVWj7Hee4Sj9PNHR7P",
    "https://gateway.irys.xyz/uZtQrAGK3-T83ETBVd2E9TZC35dWMhygXbhfLB5Tb98",
    "https://ipfs.io/ipfs/QmNYFvwHkx4FNNuZzUDqWhxuY4F1zXxRT65bn3ABSjc8p5",
    "https://ipfs.io/ipfs/QmXpTrny2DihVsZ9JtAeHCZekW7uLUj8QkSPj4oBbgovmq",
    "https://ipfs.io/ipfs/QmXpJz1jm5TvNPQiuHHmbAga9FY2yihtySzArX85Z3ye8k",
    "https://ipfs.io/ipfs/QmTajM1YKsTX9aao9xwrvVfcWKCPQPuJ8pRNwruDc1ciuh",
    "https://ipfs.io/ipfs/QmeCHYh21VSvcURfh4yGLdW7MTrD3c6b6RowjDP7eZ7G7b",
    "https://ipfs.io/ipfs/QmYsEdQUCBNazCQ8GtWqAWowgba5sk7s3mtytxPa6xBDBQ",
    "https://ipfs.io/ipfs/QmPUD6uK5NMvbPN6AMFoVWfiUeVyrLZuPv7uMUF4GmtcE2",
    "https://ipfs.io/ipfs/QmYaFbKrjqonWQoZaqqBck7tvy28NBXPZiMet24Jifv5c8",
    "http://73.125.251.92:11112/json/1330840105027375215.json",
    "https://ipfs.io/ipfs/QmWma2o6ELXiPhaRPGUoXyY5GWdQZuQTkdupWTC6QwVtMn",
    "https://ipfs.io/ipfs/QmcpPuLfwBoKfPNDY5eEmdFX6Vvzj6M5c4qjdw5X4N4oLN",
  ];
  const randomIndex = Math.floor(Math.random() * link.length);
  return link[randomIndex];
}

const pumpMintAndBuy = async (publicKey: PublicKey, amount: number) => {
  const args = {
    name: `${getRandomName(8)}`,
    symbol: `${getRandomName(4)}`,
    uri: getRandomLink(),
  };
  const MPL_TOKEN_METADATA = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );
  const token_mint_authority = new PublicKey(
    "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM",
  );

  const GLOBAL = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");

  const mint_account = Keypair.generate();
  let [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint_account.publicKey.toBuffer()],
    pumpKeyAccount,
  );
  let [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [
      bondingCurve.toBuffer(),
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
      mint_account.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  // const bonding_curve = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
  let [metadata, metadataBump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA.toBuffer(),
      mint_account.publicKey.toBuffer(),
    ],
    MPL_TOKEN_METADATA,
  );

  const feeRecipient = new PublicKey(
    "68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg",
  );
  const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
  );

  const mint = mint_account.publicKey;
  const mintAuthority = token_mint_authority;
  const mplTokenMetadata = MPL_TOKEN_METADATA;
  const user = publicKey;
  const systemProgram = SystemProgram.programId;
  const tokenProgram = TOKEN_PROGRAM_ID;
  const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
  const program = pumpKeyAccount;
  const argss = new PumpMintArgs(args);
  const dataBuffer = serialize(PumpMintArgsSchema, argss);

  const createBuffer = Buffer.concat([
    new Uint8Array(sighash("global", "create")),
    dataBuffer,
  ]);

  console.log({
    keys: [
      { pubkey: mint.toBase58(), isSigner: true, isWritable: false },
      { pubkey: mintAuthority.toBase58(), isSigner: false, isWritable: true },
      { pubkey: bondingCurve.toBase58(), isSigner: false, isWritable: false },
      {
        pubkey: associatedBondingCurve.toBase58(),
        isSigner: false,
        isWritable: false,
      },
      { pubkey: global.toBase58(), isSigner: false, isWritable: false },
      {
        pubkey: mplTokenMetadata.toBase58(),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: metadata.toBase58(), isSigner: false, isWritable: true },
      { pubkey: user.toBase58(), isSigner: true, isWritable: false },
      { pubkey: systemProgram.toBase58(), isSigner: false, isWritable: true },
      { pubkey: tokenProgram.toBase58(), isSigner: false, isWritable: true },
      {
        pubkey: associatedTokenProgram.toBase58(),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: rent.toBase58(), isSigner: false, isWritable: true },
      { pubkey: eventAuthority.toBase58(), isSigner: false, isWritable: true },
      { pubkey: program.toBase58(), isSigner: false, isWritable: true },
    ],
    programId: program,
    data: createBuffer,
  });
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: mint, isSigner: true, isWritable: true },
      { pubkey: mintAuthority, isSigner: false, isWritable: false },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: global, isSigner: false, isWritable: false },
      { pubkey: mplTokenMetadata, isSigner: false, isWritable: false },
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: associatedTokenProgram, isSigner: false, isWritable: false },
      { pubkey: rent, isSigner: false, isWritable: false },
      { pubkey: eventAuthority, isSigner: false, isWritable: false },
      { pubkey: program, isSigner: false, isWritable: false },
    ],
    programId: program,
    data: createBuffer,
  });
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.feePayer = publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  const bargs = new PumpBuyArgs({
    amount: new BN(amount * 1e6),
    maxSolCost: new BN(1e9),
  });
  const buyBuffer = serialize(PumpBuyArgsSchema, bargs);
  // const args = new StakeArgs({ amount:new BN( 1*1e9) });
  // const buyBuffer = serialize(StakeArgsSchema, args);

  const associatedUser = getAssociatedTokenAddressSync(mint, publicKey);
  const accountGenrateTx = createAssociatedTokenAccountInstruction(
    publicKey,
    associatedUser,
    publicKey,
    mint,
  );
  const data = Buffer.concat([
    new Uint8Array(sighash("global", "buy")),
    buyBuffer,
  ]);

  const binstruction = new TransactionInstruction({
    keys: [
      { pubkey: global, isSigner: false, isWritable: true },
      { pubkey: feeRecipient, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedUser, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: systemProgram, isSigner: false, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: true },
      { pubkey: rent, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: false, isWritable: true },
      { pubkey: program, isSigner: false, isWritable: true },
    ],
    programId: program,
    data: data,
  });

  try {
    const getAccountPDA = await getAccount(connection, associatedUser);
    if (!getAccountPDA) {
      throw "token PDA not init";
    } else {
      console.log("Account already init ::", getAccountPDA);
    }
  } catch (e) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        associatedUser,
        publicKey,
        mint,
      ),
    );
  }
  transaction.add(binstruction);
  transaction.feePayer = publicKey;
  transaction.partialSign(mint_account);
  let signedTransaction = await signTxn(transaction);
  console.log(signedTransaction);

  try {
    const txid = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    return mint_account.publicKey.toBase58();
    console.log("Transaction sent with ID:", txid);
  } catch (error) {
    console.error("Transaction failed:", error);
    return false;
  }
};

const fetchPumpData = async (token: PublicKey) => {
  let [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), token.toBuffer()],
    pumpKeyAccount,
  );
  let [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [
      bondingCurve.toBuffer(),
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
      token.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const mint = token;
  const feeRecipient = new PublicKey(
    "68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg",
  );

  const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
  );

  return {
    bondingCurve,
    associatedBondingCurve,
    mint,
    feeRecipient,
    global,
    rent,
    eventAuthority,
  };
};

function sighash(namespace: string, name: string): Buffer {
  const preimage = `${namespace}:${name}`;
  const hash = createHash("sha256");
  hash.update(preimage);
  const fullHash = hash.digest();
  return fullHash.slice(0, 8);
}

export {
  addressBooks,
  userStakeSol,
  userWithdrawSol,
  userBorrowToken,
  userRepayToken,
  pumpBuyTest,
  userLeverageTokenPump,
  userCloseTokenPump,
  userCloseTokenRaydium,
  pumpSellTest,
  fetchPumpData,
  pumpMintTest,
  pumpMintAndBuy,
};
