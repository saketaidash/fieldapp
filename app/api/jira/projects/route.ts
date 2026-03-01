import { NextResponse } from "next/server";
import { getProjects, getBoards } from "@/lib/jira/projects";

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  try {
    const [projects, boards] = await Promise.all([getProjects(), getBoards()]);
    return NextResponse.json({ projects, boards });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/jira/projects]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
