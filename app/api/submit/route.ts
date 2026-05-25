import { evaluateCandidate, serializeProfil } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = [
      "firstName",
      "lastName",
      "telegramUsername",
      "university",
      "hobbies",
      "selfDescription",
      "egoScenario",
      "crisisScenario",
    ] as const;

    for (const field of required) {
      if (!body[field] || typeof body[field] !== "string") {
        return NextResponse.json(
          { error: `Câmp obligatoriu lipsă: ${field}` },
          { status: 400 }
        );
      }
    }

    if (typeof body.hasExperience !== "boolean") {
      return NextResponse.json(
        { error: "hasExperience trebuie să fie boolean" },
        { status: 400 }
      );
    }

    const payload = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      telegramUsername: body.telegramUsername.trim(),
      university: body.university.trim(),
      hobbies: body.hobbies.trim(),
      selfDescription: body.selfDescription.trim(),
      hasExperience: body.hasExperience,
      experienceDetails: body.experienceDetails?.trim(),
      egoScenario: body.egoScenario.trim(),
      crisisScenario: body.crisisScenario.trim(),
    };

    const evaluation = await evaluateCandidate(payload);

    const candidate = await prisma.candidate.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        telegramUsername: payload.telegramUsername,
        university: payload.university,
        hobbies: payload.hobbies,
        selfDescription: payload.selfDescription,
        hasExperience: payload.hasExperience,
        experienceDetails: payload.experienceDetails ?? null,
        egoScenario: payload.egoScenario,
        crisisScenario: payload.crisisScenario,
        scorGeneral: evaluation.scor_general,
        verdict: evaluation.verdict,
        profilPsihologic: serializeProfil(evaluation),
      },
    });

    return NextResponse.json({
      success: true,
      id: candidate.id,
      scor: evaluation.scor_general,
      verdict: evaluation.verdict,
    });
  } catch (error) {
    console.error("[api/submit]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Eroare la procesarea candidaturii",
      },
      { status: 500 }
    );
  }
}
