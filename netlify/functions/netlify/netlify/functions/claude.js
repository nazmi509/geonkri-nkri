// netlify/functions/claude.js
// Serverless function — API key tersimpan aman di Netlify, TIDAK terlihat di kode frontend

exports.handler = async (event) => {
  // Hanya terima POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { prompt, zona } = JSON.parse(event.body);

    // API key diambil dari environment variable Netlify (aman, tidak terlihat publik)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "API key belum diset di Netlify Environment Variables." }),
      };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system:
          "Kamu adalah asisten pembelajaran PPKn yang ramah, antusias, dan informatif untuk siswa SMP kelas 7 Indonesia. Kamu menjelaskan materi Wilayah NKRI (Bab 5, Sub Bab B, halaman 152-159) berdasarkan Buku Teks Kurikulum Merdeka. Gunakan bahasa Indonesia yang mudah dipahami, menarik, dan penuh semangat kebangsaan. Jangan gunakan markdown — cukup teks biasa yang nyaman dibaca dan didengar.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const jawaban = data.content?.[0]?.text || "Maaf, AI tidak bisa menjawab saat ini.";

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ jawaban }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Terjadi kesalahan: " + err.message }),
    };
  }
};
