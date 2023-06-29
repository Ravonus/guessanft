/**
 * @author Chad Koslovsky <chad@technomnancy.it>
 * @file Description
 * @desc Created on 2023-06-29 12:55:50 am
 * @copyright TechnomancyIT
 */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios, { AxiosResponse } from "axios";

import {
  type Contract,
  type ContractRunner,
  ethers,
  type BaseContract,
  type Signer,
} from "ethers";
import { InfuraProvider } from "@ethersproject/providers";

interface NFTData {
  image_url: string;
  token_id: string;
}

interface CollectionData {
  address: string;
  maxSupply: number;
}

interface MyData {
  tokens: {
    token: {
      tokenId: string;
      image: string;
      contract: string;
    };
  }[];
  continuation?: string;
}

interface MyResponse {
  data: MyData;
}

const collections: Record<string, CollectionData> = {
  Azuku: {
    address: "0xed5af388653567af2f388e6224dc7c4b3241c544",
    maxSupply: 10000,
  },
  Elementals: {
    address: "0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e",
    maxSupply: 10500,
  },
};

interface NFTDataResponse {
  data: Array<NFTData>;
}

interface NFTDataResponse {
  tokenId: string;
  image: string;
  contract: string;
}

const getRandomNFTFromReservoir = async (
  collection: CollectionData
): Promise<NFTDataResponse> => {
  const randomID = Math.floor(Math.random() * collection.maxSupply);

  try {
    const url = `https://api.reservoir.tools/tokens/v6?tokens=${collection.address}:${randomID}`;

    const res: MyResponse = await axios.get(url, {
      headers: {
        "x-api-key": `${process.env.RESERVOIR_API_KEY || ""}`,
        contentType: "application/json",
      },
    });

    if (!res?.data?.tokens[0]?.token?.tokenId)
      return await getRandomNFTFromReservoir(collection);

    //also make sure picture exists
    if (!res?.data?.tokens[0]?.token?.image)
      return await getRandomNFTFromReservoir(collection);

    return res?.data?.tokens[0]?.token as NFTDataResponse;
  } catch (error) {
    console.error("Error fetching data from Reservoir API: ");
    //reroll until valid NFT
    return await getRandomNFTFromReservoir(collection);
  }
};

export const nftRouter = createTRPCRouter({
  getRandomNFT: publicProcedure.mutation(async () => {
    const collectionNames = Object.keys(collections);

    const randomCollectionName =
      collectionNames[Math.floor(Math.random() * collectionNames.length)];

    const randomCollectionId = collections[
      randomCollectionName as keyof CollectionData
    ] as CollectionData;

    // getRandomNFTFromBlockChain(randomCollectionId);
    const NFT = await getRandomNFTFromReservoir(randomCollectionId);

    return NFT;
  }),
});
