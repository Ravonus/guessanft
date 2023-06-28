/**
 * @author Chad Koslovsky <chad@technomnancy.it>
 * @file Description
 * @desc Created on 2023-05-15 3:26:37 am
 * @copyright TechnomancyIT
 */

import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

interface MyRequestBody extends NextApiRequest {
  query: {
    address: string;
  };
}

interface MyResponse {
  data: MyData;
}

interface MyData {
  tokens: {
    token: {
      tokenId: string;
    };
  }[];
  continuation?: string;
}

const getTokensFromReservoirAPI = async (
  collectionAddress: string,
  accountAddress: string,
  exitingTokens: any[] = [],
  continuation?: string
): Promise<string[]> => {
  try {
    let url = `${
      process.env.RESERVOIR_URL as string
    }/users/${accountAddress}/tokens/v7?collection=${collectionAddress}&limit=100`;
    if (continuation) {
      url = `${url}&continuation=${continuation}`;
    }
    const response: MyResponse = await axios.get(url, {
      headers: {
        "x-api-key": `${process.env.RESERVOIR_API_KEY || ""}`,
        contentType: "application/json",
      },
    });

    if (response?.data.continuation) {
      //filter only tokenId object
      const tokenIds = response.data.tokens.map(
        (tokenObject) => tokenObject.token.tokenId
      );
      const newTokens = exitingTokens.concat(tokenIds) as string[];
      return getTokensFromReservoirAPI(
        collectionAddress,
        accountAddress,
        newTokens,
        response.data.continuation
      );
    }
    //filter out just the tokenID object from the response
    const tokenIds = response.data.tokens.map(
      (tokenObject) => tokenObject.token.tokenId
    );

    return exitingTokens.concat(tokenIds) as string[];
  } catch (error) {
    console.log(error);
    throw new Error("Error getting tokens from reservoir API");
  }
};

export default function handler(req: MyRequestBody, res: NextApiResponse) {
  const address = req.query.address.toLowerCase();

  if (!address) {
    return res.status(400).json({ error: "Need address" });
  }
  //check if address is valid

  //get tokens from reservoir API
  getTokensFromReservoirAPI(
    process.env.NEXT_PUBLIC_GARDENS_CONTRACT as string,
    address
  )
    .then((tokens) => {
      return res.status(200).json({ tokens });
    })
    .catch((error: { message: string }) =>
      res.status(400).json({ error: error.message })
    );
}
