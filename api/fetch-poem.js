export default async function handler(req, res) {
  const API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key is missing." });
  }

  try {
    // Hugging Face API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/gemma-1.1-7b-it",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs:
            "Write a poem about the winter solstice. Limit the poem to 20 words or fewer.",
          parameters: {
            return_full_text: false,
            temperature: 0.8,
            top_p: 0.9,
            seed: Math.floor(Math.random() * 10000),
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Hugging Face API error: ${response.status}, Response: ${errorText}`
      );
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching poem:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch poem from Hugging Face API" });
  }
}
