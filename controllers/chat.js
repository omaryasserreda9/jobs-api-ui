const { StatusCodes } = require("http-status-codes");
const Job = require("../models/Job");
const { BadRequestError } = require("../errors");
const { InferenceClient } = require("@huggingface/inference");

let apiKey = process.env.CHAT_BOT_API_KEY;
const hf = new InferenceClient(apiKey);

const getAIReply = async (message, jobSummaries) => {
  const replyPrompt = `
    User says: "${message}"
    Available pending jobs: ${JSON.stringify(jobSummaries)}
    Write a friendly, helpful reply suggesting some of these jobs.
  `;

  const response = await hf.chatCompletion({
    model: "Qwen/Qwen2.5-7B-Instruct",
    messages: [{ role: "user", content: replyPrompt }],
    max_tokens: 150,
  });

  return response.choices[0].message.content;
};

const chat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new BadRequestError("Please provide a message to chat.");
  }

  try {
    const jobs = await Job.find({ status: "pending" }).lean();

    const jobSummaries = jobs.map(
      ({ roleRequirements, roleDescription, position, _id }) => ({
        id: _id,
        roleDescription,
        position,
        roleRequirements,
      }),
    );

    const reply = await getAIReply(message, jobSummaries);

    res.status(StatusCodes.OK).json({ reply });
  } catch (error) {
    console.error(
      "Full error body:",
      JSON.stringify(error.httpResponse?.body, null, 2),
    );

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Something went wrong" });
  }
};

module.exports = {
  chat,
};
