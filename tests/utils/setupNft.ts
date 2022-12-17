import { bundlrStorage, keypairIdentity, Metaplex, token } from "@metaplex-foundation/js";
import { createMint, getAssociatedTokenAddress } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";

export const setupNft = async (program, payer) => {
  const metaplex = Metaplex.make(program.provider.connection).use(keypairIdentity(payer)).use(bundlrStorage());

  const nft = await metaplex.nfts().create({
    uri: "",
    name: "Test NFT",
    sellerFeeBasisPoints: 0,
  });

  console.log("NFT Metadata Pubkey: ", nft.metadataAddress.toBase58());
  console.log("NFT Token Address: ", nft.tokenAddress.toBase58());

  const [delegatedAuthPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    program.programId
  );

  const [stakeStatePDA] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")], program.programId);

  console.log("Delegated Authority PDA: ", delegatedAuthPDA.toBase58());
  console.log("Stake State PDA: ", stakeStatePDA.toBase58());

  const [mintAuth] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("mint")], program.programId);

  const mint = await createMint(program.provider.connection, payer, mintAuth, null, 2);
  console.log("Mint PUBKEY: ", mint.toBase58());

  const tokenAddress = await getAssociatedTokenAddress(mint, payer.PublicKey);

  return {
    nft: nft,
    delegatedAuthPDA: delegatedAuthPDA,
    stakeStatePDA: stakeStatePDA,
    mint: mint,
    mintAuth: mintAuth,
    tokenAddress: tokenAddress,
  };
};
