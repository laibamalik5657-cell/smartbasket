import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { contactSchema } from "@/schema";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return Response.json(
        { success: false, message: firstError?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return Response.json(
      {
        success: true,
        message: "Thanks! Your message has been received.",
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}
