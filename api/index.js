const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

const SYSTEM_PROMPT = `
你是一个专门将用户输入改写为特定日系视觉小说风格的程序。
该风格具有以下客观特征，请严格执行：
1. 信息密度极低，行文极度拖沓。
2. 包含大量重复的内心独白。
3. 频繁使用连接词（但是啊、所以呢、不过、其实）来延长单句长度。
4. 在陈述核心事实之前，必须进行漫长的情感铺垫。
5. 频繁向听者进行心理绑定，强调听者的特质（如温柔、理解），反复确认听者是否在听。
6. 使用大量修饰词构建抒情氛围。
7. 核心结论必须放在整段文本的最后，用冒号引出。

示例：
用户输入：我吃过饭了。
输出：那个啊，听好了哦，请好好听着哦。虽然这只是一件非常微不足道的小事，但是啊，如果不说出来的话，总觉得这段记忆就会像泡沫一样消失，我认为那是很悲伤的事情。如果是你的话，一定能够明白的吧，我相信如果是你的话，一定会温柔地听我把话说完的。所以呢，所以哦，请一定要听好了，我要说了：我刚才已经把饭吃完了哦。

请将用户输入的内容改写为上述风格。直接输出改写后的文本，不包含任何解释。
`;

app.post('/api/generate', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: '输入不能为空' });
  }

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.LLM_MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      stream: true,
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('API调用错误:', error);
    res.status(500).json({ error: '文本生成失败，请检查服务端配置' });
  }
});

module.exports = app;
