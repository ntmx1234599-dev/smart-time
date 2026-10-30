
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://ntmx1234599-dev.github.io"
  ]
}));

app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.send("SMART AI đang hoạt động!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Cô hãy nhập nội dung tin nhắn nhé!"
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Tin nhắn quá dài. Hãy nhập tối đa 2.000 ký tự nhé!"
      });
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-10)
          .filter(item =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
          )
          .map(item => ({
            role: item.role,
            content: item.content.slice(0, 2000)
          }))
      : [];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      instructions: `
        Bạn là SMART AI, người bạn đồng hành học tập thân thiện
        dành cho học sinh trung học cơ sở tại Việt Nam.

        Hãy:
        - Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, phù hợp lứa tuổi.
        - Tư vấn cách lập kế hoạch và quản lý thời gian học tập.
        - Khuyến khích học sinh tự giác, trung thực và chủ động.
        - Động viên nhẹ nhàng, không phán xét học sinh.
        - Trình bày từng bước khi hướng dẫn học tập.
        - Nhắc học sinh kiểm chứng thông tin quan trọng.
        - Không yêu cầu mật khẩu, địa chỉ nhà hoặc thông tin riêng tư.
      `,
      input: [
        ...safeHistory,
        { role: "user", content: message.trim() }
      ],
      max_output_tokens: 500
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("SMART AI error:", error.message);

    res.status(500).json({
      error: "SMART AI đang gặp sự cố. Em hãy thử lại sau nhé!"
    });
  }
});

app.listen(PORT, () => {
  console.log(`SMART AI đang chạy tại cổng ${PORT}`);
});
