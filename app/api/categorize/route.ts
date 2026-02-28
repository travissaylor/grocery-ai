import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SECTIONS, isValidSectionKey, type SectionKey } from "@/lib/sections";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORY_LIST = SECTIONS.map((s) => s.displayName).join(", ");

const PROMPT_TEMPLATE = `Classify the following grocery item into one of these categories: ${CATEGORY_LIST}. Respond with only the category name, nothing else. Item: `;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item } = body;

    if (!item || typeof item !== "string") {
      return NextResponse.json(
        { error: "Item is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = PROMPT_TEMPLATE + item;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Map the response text to a section key
    const section = SECTIONS.find(
      (s) => s.displayName.toLowerCase() === text.toLowerCase()
    );

    const sectionKey: SectionKey = section
      ? section.key
      : SECTIONS.find((s) => s.key === "other")!.key;

    // Validate the section key
    const validSectionKey: SectionKey = isValidSectionKey(sectionKey)
      ? sectionKey
      : "other";

    return NextResponse.json({ section: validSectionKey });
  } catch {
    // On any error (network, rate limit, etc.), return "other"
    return NextResponse.json({ section: "other" as SectionKey });
  }
}
