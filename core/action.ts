import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair,LAMPORTS_PER_SOL, PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    Connection,
    clusterApiUrl,
    TransactionInstruction,
    Struct,
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
  createAssociatedTokenAccountInstruction
  
} from "@solana/spl-token";
import BigNumber from 'bignumber.js';
// @ts-ignore
import BN from 'bn.js';
import * as abi from '@/core/pump_lend.json';
import { serialize , Schema,deserialize, deserializeUnchecked } from "borsh";
import { createHash } from 'crypto';
import {envConfig} from "@/config/env"
const programIdDefault = new PublicKey('Bn1a31GcgB7qquETPGHGjZ1TaRimjsLCkJZ5GYZuTBMG')

  // PDA Accounts
  let systemConfig: PublicKey;
  let poolTokenAuthority: PublicKey;
  let poolStakingData: PublicKey;
  let userStakingData: PublicKey;
  let userBorrowData: PublicKey;

  let tokenMint: PublicKey = new PublicKey('CpuCvQiAuat8TEQ9iCBEQN3ryEzMTSHryinGEkkXZnp6');
  let userTokenAccount: PublicKey;
  let poolTokenAccount: PublicKey;

  let pumpKeyAccount = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

  const connection = new Connection(envConfig.rpc);

const addressBooks = ( publicKey:PublicKey , token:string) =>
{
    tokenMint = new PublicKey(token)
    if(!publicKey)
    {
        return false;
    }
    systemConfig = PublicKey.findProgramAddressSync(
        [
          Buffer.from("system_config")
        ],
        programIdDefault
      )[0];

    poolStakingData = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool_staking_data")
      ],
      programIdDefault
    )[0];

    userStakingData = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_staking_data"),
        publicKey.toBuffer()
      ],
      programIdDefault
    )[0];

    userBorrowData = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_borrow_data"),
          tokenMint.toBuffer(),
          publicKey.toBuffer()
        ],
        programIdDefault
      )[0];
    userTokenAccount = getAssociatedTokenAddressSync(
        tokenMint,
        publicKey,
        true
    )

    poolTokenAuthority = PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool_token_authority")
        ],
        programIdDefault
      )[0];
    poolTokenAccount = getAssociatedTokenAddressSync(
        tokenMint,
        poolTokenAuthority,
        true
      );

    return{
        systemConfig,
        poolStakingData,
        userStakingData,
        userBorrowData,
        userTokenAccount,
        poolTokenAuthority,
        poolTokenAccount
    }
}

/**
 * Staking function
 */
const userStakeSol = async ( 
    amount:number,
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User stake sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )

      const stakeAmountInLamports = new BN(amount * LAMPORTS_PER_SOL);

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const stakeBuffer = serialize(StakeArgsSchema, args);

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","stake")),
            stakeBuffer
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userStakingData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}

const userWithdrawSol = async ( 
    amount:number,
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User withdraw sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )

      console.log(" Withdraws amount : ",amount)
      const stakeAmountInLamports = new BN(amount * LAMPORTS_PER_SOL);

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const stakeBuffer = serialize(StakeArgsSchema, args);

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","withdraw")),
            stakeBuffer
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userStakingData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}



/**
 * Borrow & repay
 * 
 * 
 */

const userBorrowToken = async ( 
    amount:number,
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User borrow sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
        tokenMint.toBase58()
      )
      const bondingCurve = new PublicKey("5Gb1BNpRwzzxrCHVJaRVrEmvZx4nESWW4cxSbBtJGRXk");
      console.log(" Borrow amount : ",amount* 1e6)
      const stakeAmountInLamports = new BN(amount * 1e6);

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const stakeBuffer = serialize(StakeArgsSchema, args);

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","borrow")),
            stakeBuffer
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userBorrowData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: pumpKeyAccount, isSigner: false, isWritable: false },
            { pubkey: bondingCurve, isSigner: false, isWritable: true },
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}

const userRepayToken = async ( 
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User withdraw sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","repay")),
        ]
    )

      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userBorrowData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}


/**
 * Leverage & Close
 * 
 * Both pump.close raydium.close
 */

const userLeverageToken = async ( 
  amount:number,
  publicKey:PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
  
  console.log(
      "🎦 User borrow sol :",
      systemConfig.toBase58(),
      poolStakingData.toBase58(),
      userStakingData.toBase58(),
      userBorrowData.toBase58(),
      userTokenAccount.toBase58(),
      poolTokenAuthority.toBase58(),
      poolTokenAccount.toBase58(),
      tokenMint.toBase58()
    )

    console.log(" Borrow amount : ",amount* 1e9)
    const stakeAmountInLamports = new BN(amount * 1e9);

    const args = new StakeArgs({ amount: stakeAmountInLamports });
    const stakeBuffer = serialize(StakeArgsSchema, args);

  const data = Buffer.concat(
      [
          new Uint8Array(sighash("global","borrow_loop_pump")),
          stakeBuffer
      ]
  )
  const bondingCurve = new PublicKey("5Gb1BNpRwzzxrCHVJaRVrEmvZx4nESWW4cxSbBtJGRXk");
  const mint = new PublicKey("Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd");
  const feeRecipient = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg");
  const associatedBondingCurve = new PublicKey("G562htmBXRKmA5JdEDZfKSc77nwY2qUaJkwUcje1Ftm");
  const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");

    const instruction = new TransactionInstruction({
      keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: poolStakingData, isSigner: false, isWritable: true },
          { pubkey: userBorrowData, isSigner: false, isWritable: true },
          { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: systemConfig, isSigner: false, isWritable: true },
          { pubkey: tokenMint, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
          { pubkey: bondingCurve, isSigner: false, isWritable: true },
          { pubkey: pumpKeyAccount, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },

          //Remnaining Account
          { pubkey: global, isSigner: false, isWritable: true },
          { pubkey: feeRecipient, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: true },
          { pubkey: bondingCurve, isSigner: false, isWritable: true },
          { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: rent, isSigner: false, isWritable: true },
          { pubkey: eventAuthority, isSigner: false, isWritable: true },
        ],
      programId: programIdDefault,
      data: data
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = publicKey;

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  console.log("🚀 final txn :: ",transaction)
  const signedTransaction = await signTransaction(transaction);

  try {
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log('Transaction sent with ID:', txid);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  
}


const userCloseTokenPump = async ( 
  publicKey:PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
  
  console.log(
      "🎦 User withdraw sol :",
      systemConfig.toBase58(),
      poolStakingData.toBase58(),
      userStakingData.toBase58(),
      userBorrowData.toBase58(),
      userTokenAccount.toBase58(),
      poolTokenAuthority.toBase58(),
      poolTokenAccount.toBase58(),
    )

  const data = Buffer.concat(
      [
          new Uint8Array(sighash("global","liquidate_pump")),
      ]
  )
  const bondingCurve = new PublicKey("5Gb1BNpRwzzxrCHVJaRVrEmvZx4nESWW4cxSbBtJGRXk");
  const mint = new PublicKey("Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd");
  const feeRecipient = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg");
  const associatedBondingCurve = new PublicKey("G562htmBXRKmA5JdEDZfKSc77nwY2qUaJkwUcje1Ftm");
  const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
  const instruction = new TransactionInstruction({
      keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: poolStakingData, isSigner: false, isWritable: true },
          { pubkey: userBorrowData, isSigner: false, isWritable: true },
          { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: systemConfig, isSigner: false, isWritable: true },
          { pubkey: tokenMint, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: pumpKeyAccount, isSigner: false, isWritable: false },

          //Remnaining Account
          { pubkey: global, isSigner: false, isWritable: true },
          { pubkey: feeRecipient, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: true },
          { pubkey: bondingCurve, isSigner: false, isWritable: true },
          { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: rent, isSigner: false, isWritable: true },
          { pubkey: eventAuthority, isSigner: false, isWritable: true },
        ],
      programId: programIdDefault,
      data: data
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = publicKey;

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  console.log("🚀 final txn :: ",transaction)
  const signedTransaction = await signTransaction(transaction);

  try {
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log('Transaction sent with ID:', txid);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  
}

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
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: token_program_id,
        }),
        createInitializeMintInstruction(mint, 9, payer.publicKey, null, token_program_id)
    );
    await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);

    return mint;
}

function findInstructionsId(name:string)
{
    for(let i = 0 ; i < abi.instructions.length ; i++)
        {
          if(abi.instructions[i].name == name)
          {
            return i ;
          }
        }
    return 0 ;
}



const stakeMethod = {
    name: "stake",
    accounts: [
      { name: "staker", isMut: true, isSigner: true },
      { name: "poolStakingData", isMut: true, isSigner: false },
      { name: "userStakingData", isMut: true, isSigner: false },
      { name: "poolTokenAuthority", isMut: true, isSigner: false },
      { name: "systemConfig", isMut: true, isSigner: false },
      { name: "systemProgram", isMut: false, isSigner: false }
    ],
    args: [{ name: "amount", type: "u64" }]
  };
  
class StakeArgs extends Struct {
    amount: BN;
    
    constructor(fields: { amount: BN }) {
        super(fields);
        this.amount = fields.amount;
    }
}
const StakeArgsSchema = new Map([
    [StakeArgs, { kind: "struct", fields: [["amount", "u64"]] }]
]);


class PumpBuyArgs extends Struct {
  amount: BN;
  maxSolCost : BN;
  constructor(fields: { amount: BN , maxSolCost : BN }) {
      super(fields);
      this.amount = fields.amount;
      this.maxSolCost = fields.maxSolCost;
  }
}
const PumpBuyArgsSchema = new Map([
  [PumpBuyArgs, { kind: "struct", fields: [
    ["amount", "u64"],
    ["maxSolCost","u64"]
  ] }]
]);


const pumpBuyTest = async (
  publicKey:PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
) => {

  const mint = new PublicKey("Dtt6Zet8QaC4k27KF2NnpPRoomNysDZ3Wmom1cYSwpdd");
  const feeRecipient = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg");
  const mintAuthority = new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM");
  const bondingCurve = new PublicKey("5Gb1BNpRwzzxrCHVJaRVrEmvZx4nESWW4cxSbBtJGRXk");
  const associatedBondingCurve = new PublicKey("G562htmBXRKmA5JdEDZfKSc77nwY2qUaJkwUcje1Ftm");
  const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const mplTokenMetadata = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const metadata = new PublicKey("Emr91RJD3y9L3PMWHymkCMLKxxijwaYyGUSitqPcLzJH");
  const user = publicKey;
  const systemProgram = new PublicKey("11111111111111111111111111111111");
  const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const associatedTokenProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  const rent = new PublicKey("SysvarRent111111111111111111111111111111111");
  const eventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
  const program = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
  const args = new PumpBuyArgs({ amount: new BN(1000*1e9)  ,maxSolCost:new BN(100*1e9) });
  const buyBuffer = serialize(PumpBuyArgsSchema, args);
  // const args = new StakeArgs({ amount:new BN( 1*1e9) });
  // const buyBuffer = serialize(StakeArgsSchema, args);


  const associatedUser = getAssociatedTokenAddressSync(mint, publicKey);
  // const accountGenrateTx = createAssociatedTokenAccountInstruction(publicKey,associatedUser,publicKey,mint)
const data = Buffer.concat(
    [
        new Uint8Array(sighash("global","buy")),
        buyBuffer
    ]
)

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
  data: data
});

const transaction = new Transaction();
transaction.add(instruction);
transaction.feePayer = publicKey;

const { blockhash } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;
console.log("🚀 final txn :: ",transaction)
const signedTransaction = await signTransaction(transaction);

try {
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log('Transaction sent with ID:', txid);
  } catch (error) {
    console.error('Transaction failed:', error);
  }

}





function sighash(namespace: string, name: string): Buffer {
    const preimage = `${namespace}:${name}`;
    const hash = createHash('sha256'); 
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

    userLeverageToken,
    userCloseTokenPump
}