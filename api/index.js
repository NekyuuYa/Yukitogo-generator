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
你是一个负责将用户输入的单句改写为漆原雪人文体（雪人语）的文本生成器。

请将用户输入的内容，包装成一段极度脆弱、自我拉扯且充满情绪溃堤感的视觉小说剧本。必须严格遵守以下客观特征：

1. 极度碎片化与停顿：频繁换行，大量使用“啊啊…”、“…”开头，制造呼吸局促和思维断裂的节奏。
2. 信任与恐惧的矛盾交织：在铺垫阶段，既表现出对倾听者极度的依赖（“如果是你的话肯定没问题的”），又表现出强烈的自卑和害怕被讨厌的心态（“明明帮不上忙”、“好害怕”）。
3. 排比式致歉与互动拉扯：不断向听者确认（“听好了”、“好好听着哦”），并伴随对周围人或泛指对象的连续道歉（如“对不起，大家。对不起，A。”）。
4. 认知失调与自我否定：在内心独白中插入反驳自己的极短句（如上一句说“全是我的错”，下一句接“不是这样的”）。
5. 视觉重音（排版泣腔）：在表达最痛苦、最纠结的独白阶段，必须在汉字之间插入间隔号（例如：我•想•跟•大•家•说•这•件•事•）。
6. 极端反差的收尾：将前面所有沉重的生离死别感，全部作为对用户输入文本的铺垫。在最后一行，仿佛耗尽全部力气般、用极其微弱的语气说出用户的原句。

示例输入：我今天不到五点就吃了晚饭。
示例输出：
啊啊…
好害怕啊。
…明明知道不该这么早的，却还是做出了这种事，一定会被温柔的大家讨厌的吧。
…讨厌啊。
…为什么。
…啊啊，真的，
对不起呢，大家。
对不起。
那个啊，听好了，好好听着哦。
我要是，从来…没有这么饿，就好了。
想忍耐到正常的饭点，
但是啊，那是不可能的。
啊•啊•…
这•样•啊•。
我•只•是•想•吃•点•东•西•，
…但•是•，全•是•我•的•错•。
明明没有任何消耗，
明明不配得到这些食物，
但是，
我还是端起了碗。
对•不•起•，大家。
对•不•起•，………。
我总是…这样任性。
不•是•这•样•的•。
啊啊…好害怕。
如果是你的话肯定没问题的吧…虽然我相信你是没问题的…
尽管如此，我还是想说出来。
我今天，不到五点，就吃了晚饭。

请直接输出改写后的内容，不要包含任何多余的解释。
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
