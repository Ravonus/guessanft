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
  const [gameStatus, setGameStatus] = useState("notStarted"); // or "inProgress" or "finished"
  const [currentRound, setCurrentRound] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [shouldStartCountdown, setShouldStartCountdown] = useState(false);
  const [restart, setRestart] = useState(false);

  const [lastIncorrect, setLastIncorrect] = useState("");

  const nft = api.nft.getRandomNFT.useMutation();
  const router = useRouter();

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (countdown > 0 && shouldStartCountdown) {
      countdownTimer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0 && shouldStartCountdown && !roundInProgress) {
      // Timeout expired, request a new NFT
      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      requestNFT();
      setShouldStartCountdown(false); // Prevent the countdown from starting automatically
    }

    return () => {
      clearTimeout(countdownTimer);
    };
  }, [countdown, shouldStartCountdown]);

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

  useEffect(() => {
    if (restart) requestNFT();
    setRestart(false);
  }, [restart]);

  const handleGuess = async (collection: string) => {
    if (currentRound > 10) {
      return;
    }
    if (!nftData) return;
    if (roundInProgress) return; // Prevent multiple guesses in the same round
    setRoundInProgress(true); // Start a round
    if (nftData.contract === collection) {
      toast.success("Correct!");
      setAnswers((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      toast.error("Nope!");
      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setLastIncorrect(nftData.image);
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 0.5 seconds before requesting a new NFT
    requestNFT();
  };

  function requestNFT() {
    setShouldStartCountdown(false);
    if (currentRound < 10) {
      setCurrentRound((prevRound) => prevRound + 1); // Go to the next round
      nft
        .mutateAsync()
        .then((data) => {
          setNftData(data);
          setCountdown(5);
          setShouldStartCountdown(true); // Start the countdown
          setRoundInProgress(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setGameStatus("finished");
      setCountdown(0);

      toast.success("Game finished!");
    }
  }

  const shareScoreOnTwitter = () => {
    const correct = `${answers.correct}`;
    const incorrect = `${answers.incorrect}`;

    const appLink = "https://pfpguessr.com";

    const scoreText = `I scored ${correct}/10 in Azuki VS Elemental ${appLink}`;
    const createdBy = "@R4vonus";

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      scoreText + `\n\n Created by ${createdBy}\n\n`
    )}`;

    window.open(tweetUrl);
  };

  if (!nftData) return "Loading...";

  return (
    <>
      <html>
        <Head>
          <title>Guess the PFP</title>
          <meta name="description" content="PFPGuessr" />
          <link rel="icon" href="/favicon.ico" />

          <meta property="og:url" content="https://pfpguessr.com/" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Guess the PFP" />
          <meta property="og:description" content="PFPguessr" />
          <meta
            property="og:image"
            content="https://pfpguessr.com/pfpguess.png"
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="pfpguessr.com/" />
          <meta name="twitter:site" content="@R4vonus" />
          <meta name="twitter:title" content="Guess the PFP" />
          <meta name="twitter:description" content="PFPguessr" />
          <meta
            name="twitter:image"
            content="https://pfpguessr.com/pfpguess.png"
          />
        </Head>

        <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e021d] to-[#15162c]">
          <ToastContainer />
          <div className="container -mt-32 flex flex-col items-center justify-center gap-12 px-4 py-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              PFPGuess<span className="text-[hsl(220,80%,70%)]">r</span>
            </h1>

            <div className="mt-5 flex flex-col items-center justify-center gap-4">
              <h2 className=" text-2xl font-extrabold tracking-tight text-white sm:text-[2.5rem]">
                Score
              </h2>
              <div className=" flex gap-8">
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
            {gameStatus !== "inProgress" ? (
              <img
                alt="NFT"
                src="/aore.png"
                className="rounded border-2 border-purple-500 shadow-xl transition duration-500 hover:scale-110 hover:border-purple-600"
              />
            ) : (
              <img
                alt="NFT"
                src={nftData.image}
                className="rounded border-2 border-purple-500 shadow-xl transition duration-500 hover:scale-110 hover:border-purple-600"
              />
            )}

            {gameStatus === "notStarted" && (
              <button
                className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
                onClick={() => {
                  setGameStatus("inProgress");
                  requestNFT();
                  setShouldStartCountdown(true); // Start the countdown when the game starts
                }}
              >
                Start
              </button>
            )}
            {gameStatus === "finished" && (
              <button
                className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
                onClick={() => {
                  setGameStatus("inProgress");
                  setCurrentRound(0);
                  setAnswers({ correct: 0, incorrect: 0 });
                  setRoundInProgress(false);
                  setRestart(true);
                }}
              >
                Restart
              </button>
            )}

            <div className="-mt-4 flex justify-center gap-4 text-white">
              {gameStatus === "inProgress" && currentRound < 11 && (
                <>
                  <button
                    className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:-translate-x-2 hover:skew-y-3 hover:scale-110 hover:bg-purple-700"
                    onClick={() => {
                      handleGuess(
                        "0xed5af388653567af2f388e6224dc7c4b3241c544"
                      ).catch((err) => {
                        console.log(err);
                      });
                    }}
                  >
                    Azuki
                  </button>
                  <button
                    className="rounded bg-purple-600 px-4 font-bold text-white shadow-xl transition duration-500 hover:translate-x-2 hover:-skew-y-3 hover:scale-110 hover:bg-purple-700"
                    onClick={() => {
                      handleGuess(
                        "0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e"
                      ).catch((err) => {
                        console.log(err);
                      });
                    }}
                  >
                    Elemental
                  </button>
                </>
              )}
            </div>
            {gameStatus === "inProgress" && (
              <div className="-mt-8 text-3xl text-white">
                Time Remaining: {countdown}
              </div>
            )}

            {gameStatus === "notStarted" && (
              <div className="-mt-8 text-3xl text-white">
                {countdown} seconds per guess
              </div>
            )}

            {gameStatus === "finished" && (
              <button
                className="-mt-12 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={shareScoreOnTwitter}
              >
                Share on Twitter
              </button>
            )}

            <div className="text-white">
              App created by{" "}
              <a
                href="https://twitter.com/R4vonus"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                @R4vonus
              </a>
            </div>
          </div>
        </main>
      </html>
    </>
  );
}
