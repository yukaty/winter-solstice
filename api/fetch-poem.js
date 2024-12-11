const API_URL = "https://api-inference.huggingface.co/models/google/gemma-1.1-7b-it";
const API_KEY = process.env.HUGGINGFACE_API_KEY;

const handleError = (res, status, message) => {
  console.error(message);
  res.status(status).json({ error: message });
};

export default async function handler(req, res) {
  try {
    const response = await fetch(API_URL, {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      return handleError(res, response.status, `Hugging Face API error: ${errorText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return handleError(res, 500, `Failed to fetch poem: ${error.message}`);
  }
}
