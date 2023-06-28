import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { api, type RouterOutputs } from "~/utils/api";
import { useRouter } from "next/router";

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
  const router = useRouter();

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (countdown > 0) {
      countdownTimer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      // Timeout expired, request a new NFT
      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
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

  const shareScoreOnTwitter = () => {
    const scoreText = `My score in the Guess the NFT Collection game: Correct - ${answers.correct}, Incorrect - ${answers.incorrect}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      scoreText
    )}`;
    window.open(tweetUrl);
  };

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
            Guess the <span className="text-[hsl(220,80%,70%)]">NFT</span>
          </h1>

          <img
            alt="NFT"
            src={nftData.image}
            className="rounded border-2 border-purple-500 shadow-xl transition duration-500 hover:scale-110 hover:border-purple-600"
          />

          <div className="flex justify-center gap-4 text-white">
            <button
              className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:-translate-x-2 hover:skew-y-3 hover:scale-110 hover:bg-purple-700"
              onClick={() =>
                handleGuess("0xed5af388653567af2f388e6224dc7c4b3241c544")
              }
            >
              Azuki
            </button>
            <button
              className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:translate-x-2 hover:-skew-y-3 hover:scale-110 hover:bg-purple-700"
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

          <button
            className="mt-8 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={shareScoreOnTwitter}
          >
            Share on Twitter
          </button>
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
