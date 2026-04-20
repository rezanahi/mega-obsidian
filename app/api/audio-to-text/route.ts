import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const audioFile = formData.get("audio") as File

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file" }, { status: 400 })
        }

        // مهم: لاگ برای اطمینان از این‌که کلید خوانده شده است
        console.log("GROQ KEY (first chars):", process.env.GROQ_API_KEY?.slice(0, 6))

        const fd = new FormData()
        fd.append("file", audioFile)
        fd.append("model", "whisper-large-v3")

        const groqRes = await fetch(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: fd,
            }
        )

        const text = await groqRes.text()
        console.log("Groq raw response:", text)

        const json = JSON.parse(text)

        return NextResponse.json(json)

    } catch (error) {
        console.error("API ERROR:", error)
        return NextResponse.json({ error: "AI error" }, { status: 500 })
    }
}
