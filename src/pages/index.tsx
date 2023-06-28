import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { api, type RouterOutputs } from "~/utils/api";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

function checkGuess(collection: string, guess: string) {
  // Replace this with your actual logic to check the user's guess
  // Return value should be a boolean indicating whether the guess was correct
  return collection === guess;
}

export default function Home() {
  const [nftData, setNftData] =
    useState<RouterOutputs["nft"]["getRandomNFT"]>();

  const [refetchData, setRefetchData] = useState(false);

  const [guess, setGuess] = useState(null);
  const [result, setResult] = useState(null);

  const nft = api.nft.getRandomNFT.useMutation();

  if (nft.isIdle && !nftData) {
    nft
      .mutateAsync()
      .then((data) => {
        setNftData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleGuess = (collection: string) => {
    // setGuess(collection);
    if (!nftData) return;
    if (checkGuess(nftData?.contract, collection)) {
      toast.success("Correct!");
    } else {
      //get new contract
      toast.error("Nope!");
    }

    setTimeout(() => {
      requestNFT();
    }, 500);

    // setResult(isCorrect ? "Correct!" : "Sorry, try again");
  };

  function requestNFT() {
    // setRefetchData(false);

    nft
      .mutateAsync()
      .then((data) => {
        setNftData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (!nftData) return "Loading...";

  return (
    <>
      <ToastContainer />
      <Head>
        <title>Guess the Collection</title>
        <meta name="description" content="Guess the NFT collection" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Guess the{" "}
            <span className="text-[hsl(280,100%,70%)]">NFT Collection</span>
          </h1>

          <img alt="NFT" src={nftData.image} />

          <div className="flex justify-center gap-4">
            <button
              onClick={() =>
                handleGuess("0xed5af388653567af2f388e6224dc7c4b3241c544")
              }
            >
              Azuki
            </button>
            <button
              onClick={() =>
                handleGuess("0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e")
              }
            >
              Elemental
            </button>
          </div>

          {guess && (
            <div>
              <p>You guessed: {guess}</p>
              <p>{result}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
