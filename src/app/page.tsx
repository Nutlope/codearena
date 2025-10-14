"use client";

import RibbonIcon from "@/components/icons/ribbon";
import SwordsIcon from "@/components/icons/swords";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelDropdown } from "@/components/ui/model-dropdown";
import modelBackgroundImage from "@/public/model-background.png";
import { Battle } from "@/schema";
import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import assert from "assert";
import Image from "next/image";
import Link from "next/link";
import party from "party-js";
import {
  FormEvent,
  ReactNode,
  Ref,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream.mjs";
import { z } from "zod";
import saveBattle from "./actions";
import { models } from "./models";

type App = {
  clientId: string;
  model: (typeof models)[number];
  isLoading: boolean;
  code: string;
  trimmedCode: string;
  status: "idle" | "generating" | "complete";
  completionTokens?: number;
  totalTime?: number;
};

export default function Home() {
  const [status, setStatus] = useState<"idle" | "generating" | "complete">(
    "idle",
  );
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [appA, setAppA] = useState<App>();
  const [appB, setAppB] = useState<App>();
  const [selectedTabA, setSelectedTabA] = useState("code");
  const [selectedTabB, setSelectedTabB] = useState("code");
  const [testModel, setTestModel] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSelectedTabA("code");
    setSelectedTabB("code");

    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt");
    const testModel = formData.get("testModel");

    assert.ok(typeof prompt === "string");

    setStatus("generating");
    setSubmittedPrompt(prompt);

    let modelA, modelB;

    if (testModel) {
      const model = models.find((m) => m.apiName === testModel);
      if (!model) {
        throw new Error("Test model not found");
      }
      modelA = model;
      modelB = model;
    } else {
      [modelA, modelB] = getRandomModels();
    }

    setAppA({
      clientId: crypto.randomUUID(),
      code: "",
      trimmedCode: "",
      model: modelA,
      isLoading: true,
      status: "generating",
    });
    setAppB({
      clientId: crypto.randomUUID(),
      code: "",
      trimmedCode: "",
      model: modelB,
      isLoading: true,
      status: "generating",
    });

    // create a stream for each model
    const startTime = new Date();

    const [resA, resB] = await Promise.all([
      fetch("/api/generate-app", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          model: modelA.apiName,
        }),
      }),
      fetch("/api/generate-app", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          model: modelB.apiName,
        }),
      }),
    ]);

    if (!resA.body || !resB.body) return;

    let generatingCount = 2;
    ChatCompletionStream.fromReadableStream(resA.body)
      .on("content", (delta) =>
        setAppA((app) => {
          if (!app) {
            console.log("?");
            return undefined;
          }

          const code = app.code + delta;
          const trimmedCode = trimCode(code);

          return { ...app, code, trimmedCode };
        }),
      )
      .on("totalUsage", (usage) => {
        setAppA((app) =>
          app
            ? {
                ...app,
                completionTokens: usage.completion_tokens,
              }
            : undefined,
        );
      })
      .on("end", () => {
        setTimeout(() => {
          setAppA((app) =>
            app
              ? {
                  ...app,
                  status: "complete",
                  totalTime: new Date().getTime() - startTime.getTime(),
                }
              : undefined,
          );
          setSelectedTabA("preview");
          generatingCount--;
          if (generatingCount === 0) {
            setStatus("complete");
          }
        }, 500);
      });
    ChatCompletionStream.fromReadableStream(resB.body)
      .on("content", (delta) =>
        setAppB((app) => {
          if (!app) {
            console.log("?");
            return undefined;
          }

          const code = app.code + delta;
          const trimmedCode = trimCode(code);

          return { ...app, code, trimmedCode };
        }),
      )
      .on("totalUsage", (usage) => {
        setAppB((app) =>
          app
            ? {
                ...app,
                completionTokens: usage.completion_tokens,
              }
            : undefined,
        );
      })
      .on("end", () => {
        setTimeout(() => {
          setAppB((app) =>
            app
              ? {
                  ...app,
                  status: "complete",
                  totalTime: new Date().getTime() - startTime.getTime(),
                }
              : undefined,
          );
          setSelectedTabB("preview");
          generatingCount--;
          if (generatingCount === 0) {
            setStatus("complete");
          }
        }, 500);
      });
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl">
      <div className="text-center">
        <h1 className="mt-8 font-title text-2xl font-bold tracking-[-.01em] text-gray-900 md:text-4xl">
          Which LLM Codes the Best?
        </h1>
        <p className="mx-auto mt-2 max-w-md text-balance text-sm tracking-[-.01em] text-gray-500 md:text-base">
          Watch AI models compete in real-time, and see who emerges victorious.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-2xl md:mt-8">
        <fieldset disabled={status === "generating"}>
          {/* Model selection dropdown with icons */}
          <div className="mx-auto mb-4 max-w-lg">
            <ModelDropdown
              name="testModel"
              value={testModel}
              onChange={setTestModel}
              disabled={status === "generating"}
              placeholder="Compare random models (or select a specific one)"
              className="w-full"
            />
          </div>

          <div className="relative mx-auto max-w-lg">
            <input
              className="w-full border border-gray-300 px-4 py-5"
              name="prompt"
              placeholder="Enter a prompt"
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* <div className="absolute inset-y-0 right-4 flex items-center justify-center">
              <button
                className="inline-flex size-6 items-center justify-center bg-blue-500"
                type="button"
              >
                <SwordsIcon />
              </button>
            </div> */}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[
              "Quiz app about llamas",
              "Hacker news clone",
              "Personal finance dashboard",
              "Budgeting app tracker",
            ].map((example) => (
              <Button
                onClick={() => setPrompt(example)}
                key={example}
                type="button"
                variant="secondary"
                size="sm"
              >
                {example}
              </Button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              type="submit"
              className="inline-flex h-auto w-full py-3 font-title text-base font-bold md:w-auto md:px-6"
            >
              <SwordsIcon className="size-[18px]" />
              Code Battle
            </Button>
          </div>
        </fieldset>
      </form>
      <div>
        <div
          key={submittedPrompt}
          className="mt-8 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-8"
        >
          <Result
            app={appA}
            selectedTab={selectedTabA}
            onTabSelect={setSelectedTabA}
            placeholder="Model A"
          />
          <Result
            app={appB}
            selectedTab={selectedTabB}
            onTabSelect={setSelectedTabB}
            placeholder="Model B"
          />
        </div>
      </div>

      {status === "complete" && appA && appB && (
        <Vote
          prompt={submittedPrompt}
          apps={[appA, appB]}
          onLaunchNextBattle={() => {
            setStatus("idle");
            setAppA(undefined);
            setAppB(undefined);
          }}
        />
      )}
    </div>
  );
}

function Result({
  app,
  selectedTab,
  onTabSelect,
  placeholder,
}: {
  app: App | undefined;
  selectedTab: string;
  onTabSelect: (v: string) => void;
  placeholder: string;
}) {
  if (!app) {
    return (
      <div className="relative mt-9 bg-gray-200">
        <Image
          priority
          src={modelBackgroundImage}
          alt=""
          className="aspect-square object-contain md:aspect-video"
        />
        <div className="absolute inset-x-0 top-[60%] flex items-center justify-center">
          <p className="text-lg text-gray-900">{placeholder}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={onTabSelect}>
        <div className="relative flex items-center">
          <div className="absolute flex items-center gap-2 truncate text-center text-gray-900 lg:w-full lg:justify-center">
            <Image
              src={app.model.logo}
              alt={app.model.label}
              className="h-4 w-4 object-contain"
              width={16}
              height={16}
            />
            <span>{app.model.shortLabel}</span>
          </div>
          <TabsList className="relative ml-auto h-auto bg-white p-0">
            <TabsTrigger
              className="border border-r-0 border-gray-500 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white"
              value="preview"
              disabled={app.status !== "complete"}
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              className="border border-l-0 border-gray-500 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white"
              value="code"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="mt-2">
          <SandpackProvider
            files={{ "App.tsx": app.trimmedCode }}
            template="react-ts"
            theme={dracula}
            options={{
              externalResources: [
                "https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css",
              ],
            }}
          >
            {app.status === "complete" && (
              <TabsContent
                value="preview"
                forceMount
                className="data-[state=inactive]:hidden"
              >
                <SandpackPreview
                  key={app.trimmedCode}
                  showNavigator={false}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={false}
                  showRestartButton={false}
                  showOpenNewtab={false}
                  className="aspect-square w-full"
                />
              </TabsContent>
            )}
            <TabsContent
              value="code"
              forceMount
              className="data-[state=inactive]:hidden"
            >
              <SandpackCodeEditor
                readOnly
                className={`aspect-square ${app.status === "generating" ? "[&_.cm-scroller]:flex-col-reverse" : ""} overflow-hidden [&_.cm-line]:text-[13px]`}
              />
            </TabsContent>
          </SandpackProvider>
        </div>
      </Tabs>
    </div>
  );
}

const savableAppSchema = z.object({
  model: z.object({
    label: z.string(),
    apiName: z.string(),
  }),
  code: z.string(),
  trimmedCode: z.string(),
  totalTime: z.number(),
  completionTokens: z.number(),
});

const saveBattleSchema = z.object({
  prompt: z.string(),
  winners: z.array(savableAppSchema),
  losers: z.array(savableAppSchema),
});

type State = {
  didVote: boolean;
  battle?: Battle;
  winners?: App[];
};

function Vote({
  prompt,
  apps,
  onLaunchNextBattle,
}: {
  prompt: string;
  apps: [App, App];
  onLaunchNextBattle: () => void;
}) {
  const [appA, appB] = apps;

  const [state, dispatch, isPending] = useActionState<
    State,
    { winners: App[] }
  >(
    async (previous, payload) => {
      if (previous.didVote) return previous;

      const winners = payload.winners;
      const losers = apps.filter(
        (app) => !winners.some((winner) => winner.clientId === app.clientId),
      );

      const data = saveBattleSchema.parse({ prompt, winners, losers });
      const battle = await saveBattle(data);

      return {
        battle,
        didVote: true,
        winners,
      };
    },
    { didVote: false },
  );

  return (
    <div className="mt-16 md:mt-8">
      {!state.didVote ? (
        <div>
          <p className="text-center font-title text-2xl font-semibold text-blue-500">
            Which one did better?
          </p>

          <form className="mt-6">
            <fieldset disabled={isPending || state.didVote}>
              <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  formAction={() => dispatch({ winners: [appA] })}
                  className="h-auto bg-white px-6 py-5 text-base text-gray-900"
                >
                  <span>
                    <strong className="text-blue-500">A</strong> did better
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  formAction={() => dispatch({ winners: [appB] })}
                  className="h-auto bg-white px-6 py-5 text-base text-gray-900"
                >
                  <span>
                    <strong className="text-blue-500">B</strong> did better
                  </span>
                </Button>
              </div>

              <div className="mx-auto mt-2 grid max-w-xs grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  formAction={() => dispatch({ winners: [appA, appB] })}
                  className="h-auto bg-white px-6 py-5 text-base text-gray-900"
                >
                  <span>
                    Both <strong>good</strong>
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  formAction={() => dispatch({ winners: [] })}
                  className="h-auto bg-white px-6 py-5 text-base text-gray-900"
                >
                  <span>
                    Both <strong>bad</strong>
                  </span>
                </Button>
              </div>
            </fieldset>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-center">
          <div className="md:grid md:grid-cols-2">
            <p>
              <span
                className={
                  state.winners
                    ?.map((app) => app.model.apiName)
                    .includes(appA.model.apiName)
                    ? "font-bold text-gray-900"
                    : ""
                }
              >
                Model A:
              </span>{" "}
              <strong className="font-title text-blue-500">
                {appA.model.shortLabel}
              </strong>
            </p>
            <p>
              <span
                className={
                  state.winners
                    ?.map((app) => app.model.apiName)
                    .includes(appB.model.apiName)
                    ? "font-bold text-gray-900"
                    : ""
                }
              >
                Model B:
              </span>{" "}
              <strong className="font-title text-blue-500">
                {appB.model.shortLabel}
              </strong>
            </p>
          </div>

          <div className="mt-12">
            <div className="flex justify-center">
              <Confetti>{(ref) => <div ref={ref} />}</Confetti>
            </div>

            <p className="text-gray-900">
              {state.winners?.length === 1 ? (
                <>{state.winners[0].model.shortLabel} wins!</>
              ) : state.winners?.length === 2 ? (
                <>Both models won!</>
              ) : (
                <>Neither model won.</>
              )}
            </p>

            <p className="mt-8">Thanks for voting!</p>
            <p className="text-gray-900 md:hidden">
              Check out the{" "}
              <Link
                href="/top-models"
                className="text-blue-500 underline underline-offset-[3px]"
              >
                leaderboard
              </Link>{" "}
              or try again.
            </p>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-2">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-auto w-full border-blue-500 bg-transparent py-3 font-title text-base font-bold text-blue-500"
            >
              <Link href="/top-models">
                <RibbonIcon />
                See Leaderboard
              </Link>
            </Button>
            <Button
              size="lg"
              className="h-auto w-full py-3 font-title text-base font-bold"
              onClick={onLaunchNextBattle}
            >
              <SwordsIcon />
              Launch next battle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getRandomModels() {
  const shuffled = models.sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1]];
}

function trimCode(code: string) {
  let trimmedCode = code.trim();
  trimmedCode = trimmedCode.split("\n")[0]?.startsWith("```")
    ? trimmedCode.split("\n").slice(1).join("\n")
    : trimmedCode;
  trimmedCode = trimmedCode.split("\n").at(-1)?.startsWith("```")
    ? trimmedCode.split("\n").slice(0, -1).join("\n")
    : trimmedCode;

  return trimmedCode;
}

function Confetti({
  children,
}: {
  children: (ref: Ref<HTMLParagraphElement>) => ReactNode;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!ref.current || hasRun.current) return;

    party.confetti(ref.current, { count: 100 });
    hasRun.current = true;
  }, []);

  return children(ref);
}
