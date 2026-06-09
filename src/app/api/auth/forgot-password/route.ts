import { NextRequest, NextResponse } from "next/server";
import { generateResetToken, isEmailAllowed } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: "This email is not authorized to reset password" },
        { status: 403 }
      );
    }

    const resetToken = await generateResetToken(email);

    if (!resetToken) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const resetUrl = `https://jobflow.vercel.app/reset-password?token=${resetToken}`;

    console.log(`
    ========================================
    PASSWORD RESET LINK (DEV ONLY)
    ========================================
    To: ${email}
    Reset Link: ${resetUrl}
    ========================================
    `);

    return NextResponse.json({
      success: true,
      message: "Password reset link generated. Check server console for the link.",
      devMode: true,
      resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}