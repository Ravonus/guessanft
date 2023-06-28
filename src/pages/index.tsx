import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { api, type RouterOutputs } from "~/utils/api";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [nftData, setNftData] =
    useState<RouterOutputs["nft"]["getRandomNFT"]>();
  const [answers, setAnswers] = useState({
    correct: 0,
    incorrect: 0,
  });
  const [countdown, setCountdown] = useState(5);

  const nft = api.nft.getRandomNFT.useMutation();

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (countdown > 0) {
      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      countdownTimer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      // Timeout expired, request a new NFT
      requestNFT();
    }

    return () => {
      clearTimeout(countdownTimer);
    };
  }, [countdown]);

  if (nft.isIdle && !nftData) {
    nft
      .mutateAsync()
      .then((data) => {
        setNftData(data);

        setTimeout(() => {
          // Only 5 seconds to guess
          setCountdown(5);
        }, 5000);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleGuess = (collection: string) => {
    if (!nftData) return;

    if (nftData.contract === collection) {
      toast.success("Correct!");
      setAnswers((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      toast.error("Nope!");
      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    setTimeout(() => {
      requestNFT();
    }, 500);
  };

  function requestNFT() {
    nft
      .mutateAsync()
      .then((data) => {
        setNftData(data);
        setCountdown(5);
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

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e021d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Guess the <span className="text-[hsl(280,100%,70%)]">NFT</span>
          </h1>

          <img alt="NFT" src={nftData.image} />

          <div className="flex justify-center gap-4 text-white">
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

          <div className="mt-4 text-3xl text-white">
            Time Remaining: {countdown} seconds
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-4">
          <h2 className=" text-2xl font-extrabold tracking-tight text-white sm:text-[2.5rem]">
            Score
          </h2>
          <div className=" my-8 flex gap-8">
            <div className="mx-10 flex flex-col items-center justify-center gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white sm:text-[4rem]">
                {answers.correct}
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white sm:text-[1.5rem]">
                Correct
              </span>
            </div>
            <div className="mx-10 flex flex-col items-center justify-center gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white sm:text-[4rem]">
                {answers.incorrect}
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white sm:text-[1.5rem]">
                Incorrect
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
