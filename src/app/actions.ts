"use server";

import { db } from "@/db";
import { apps, battles } from "@/schema";
import { cookies } from "next/headers";

type App = {
  model: { label: string; apiName: string };
  code: string;
  trimmedCode: string;
  completionTokens: number;
  totalTime: number;
  isMultiCall?: boolean;
};

export default async function saveBattle({
  prompt,
  winners,
  losers,
}: {
  prompt: string;
  winners: App[];
  losers: App[];
}) {
  const creatorCookie = await findOrCreateCreatorCookie();

  const result = await db
    .insert(battles)
    .values({
      prompt,
      creatorCookie,
    })
    .returning();

  const battle = result[0];

  for (const winner of winners) {
    await db.insert(apps).values({
      battleId: battle.id,
      model: winner.model.apiName,
      code: winner.code,
      trimmedCode: winner.trimmedCode,
      completionTokens: winner.completionTokens,
      totalTime: winner.totalTime,
      didWin: true,
      isMultiCall: winner.isMultiCall ?? false,
    });
  }

  for (const loser of losers) {
    await db.insert(apps).values({
      battleId: battle.id,
      model: loser.model.apiName,
      code: loser.code,
      trimmedCode: loser.trimmedCode,
      completionTokens: loser.completionTokens,
      totalTime: loser.totalTime,
      didWin: false,
      isMultiCall: loser.isMultiCall ?? false,
    });
  }

  return battle;
}

async function findOrCreateCreatorCookie() {
  const cookieStore = await cookies();
  let creatorId = cookieStore.get("creatorCookie")?.value;
  if (!creatorId) {
    creatorId = crypto.randomUUID();
    cookieStore.set("creatorCookie", creatorId, { maxAge: 60 * 60 * 24 * 365 });
  }
  return creatorId;
}
