import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (name.length < 2 || !emailPattern.test(email) || message.length < 10) return NextResponse.json({ error: "Please provide your name, a valid email address, and a message of at least 10 characters." }, { status: 400 });
    const inquiry = await prisma.contactInquiry.create({ data: { name, email, company: typeof body.school === "string" ? body.school.trim().slice(0, 200) : null, subject: typeof body.subject === "string" ? body.subject.slice(0, 100) : null, message: message.slice(0, 5000), inquiryType: typeof body.subject === "string" ? body.subject.slice(0, 100) : null, metadata: { source: "public_contact_form" } } });
    return NextResponse.json({ id: inquiry.id, message: "Thank you. Your enquiry has been received." }, { status: 201 });
  } catch (error) {
    console.error("Contact inquiry failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 500 });
  }
}
