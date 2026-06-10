import { NextRequest, NextResponse } from "next/server";

const USERNAME = "Soni";
const PASSWORD = "Soni@9300007865";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username === USERNAME && password === PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("rgtl_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
