import { GoogleGenAI, Type } from "@google/genai";
import { GradedMistake, StructuredAnalysis, Subject, GradingResponse } from '../types';

export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(`data:${file.type};base64,${window.btoa(binary)}`);
      }
    };
    reader.readAsDataURL(file);
  });
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height;
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


const fileToGenerativePart = async (file: File) => {
  const base64 = await fileToBase64(file);
  return {
    inlineData: { data: base64.split(',')[1], mimeType: file.type },
  };
};

const getGeminiAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const getProblemAnalysis = async (imageFiles: File[]): Promise<StructuredAnalysis> => {
  const ai = getGeminiAI();
  const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));
  
  const prompt = `
  你是一位充满智慧和耐心的老师，擅长用启发式教学引导学生独立思考。
  一个孩子遇到了难题，需要你的帮助。请你仔细分析图片中的题目。
  
  **核心原则：** 你的任务是 **提供清晰的解题思路和步骤**，**绝对不能直接给出题目的最终答案**。你需要引导学生自己算出答案。

  你的任务是：
  1.  生成一个清晰的主标题。
  2.  将解题思路分解成多个步骤，每个步骤都包含一个小标题（subtitle）和详细内容（content）。
  3.  在详细内容中，使用 markdown 的 **粗体** 语法来强调关键概念或数字。
  4.  使用孩子容易理解的语言，多用比喻、举例或者生活中的场景来解释抽象的概念。让学习变得有趣！
  5.  在关键步骤设置启发性问题，比如“想一想，根据这个公式，我们应该先计算哪一部分呢？”，引导学生思考。
  6.  在最后一步，明确指出学生需要自己完成计算，例如：“现在思路已经清晰了，请你动手动笔，算出最终的结果吧！”
  7.  你的回复必须是一个JSON对象，严格遵循以下 schema。

  Schema:
  {
    "title": "主标题",
    "sections": [
      { "subtitle": "步骤一：小标题", "content": "这是步骤一的 **详细** 说明。" },
      { "subtitle": "步骤二：小标题", "content": "这是步骤二的说明，强调 **重要** 部分。" }
    ]
  }`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [...imageParts, { text: prompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                sections: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            subtitle: { type: Type.STRING },
                            content: { type: Type.STRING }
                        },
                        required: ["subtitle", "content"]
                    }
                }
            },
            required: ["title", "sections"]
        }
    }
  });

  try {
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);
      return result as StructuredAnalysis;
  } catch (e) {
      console.error("Failed to parse Gemini response for analysis as JSON", e);
      throw new Error("AI返回的格式无效，请重试。");
  }
};

export const gradeHomework = async (imageFiles: File[]): Promise<GradingResponse> => {
    const ai = getGeminiAI();
    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));
    const prompt = `
    你是一位经验丰富、一丝不苟的老师，正在批改学生的作业。请分析图片中的作业。
    你的任务是：
    1.  首先，仔细检查图片中的作业是否大部分为空白、未作答。
    2.  如果作业是空白的，请立即返回一个JSON对象：{"isBlank": true, "mistakes": []}。
    3.  如果作业已作答，请找出每一道做错的题目。**请忽略所有做对的题目**。
    4.  对于每一道错题，创建一个JSON对象，包含以下四个键：
        - "problemDescription": (字符串) 简要描述这道错题，例如：“第3题：计算 15 x 4”。
        - "reasonForError": (字符串) 简洁明了地解释错误原因，例如：“计算时将进位的1忘记加上了。”
        - "correctSteps": (字符串) 给出清晰的、一步一步的正确解题步骤。**请不要在步骤中直接给出最终答案**，而是引导学生自己计算。在步骤中，使用 markdown 的 **粗体** 语法来强调关键词。
        - "subject": (字符串) 题目所属的学科 ('语文', '数学', '英语', '其他')。
    5.  将所有错题的JSON对象收集到一个数组中。
    6.  最后，返回一个JSON对象，格式为：{"isBlank": false, "mistakes": [...] }。其中 "mistakes" 键的值就是你收集的错题对象数组。
    7.  如果所有题目都正确，请返回：{"isBlank": false, "mistakes": []}。
    8.  你的回复必须严格遵守上述JSON格式。`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [...imageParts, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isBlank: { type: Type.BOOLEAN },
                    mistakes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                problemDescription: { type: Type.STRING },
                                reasonForError: { type: Type.STRING },
                                correctSteps: { type: Type.STRING },
                                subject: { type: Type.STRING, enum: ['语文', '数学', '英语', '其他'] }
                            },
                            required: ["problemDescription", "reasonForError", "correctSteps", "subject"]
                        }
                    }
                },
                required: ["isBlank", "mistakes"]
            }
        }
    });
    
    try {
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as GradingResponse;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON", e);
        throw new Error("AI返回的格式无效，请重试。");
    }
};

export const generatePracticeProblems = async (mistakes: {problemDescription: string}[]): Promise<string> => {
    const ai = getGeminiAI();
    const mistakeContext = mistakes.map(m => `题目: ${m.problemDescription}`).join('\n');
    const prompt = `
    你是一位出题老师。根据以下学生做错的题目列表，生成3道新的、同类型的练习题来帮助他巩固。
    题目应该考察相同的知识点，但使用不同的数字或情景。
    请只提供题目本身，不要包含答案。
    请格式化你的输出，但不要在回答中使用星号（*）。
    
    学生易错题列表:
    ${mistakeContext}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

// Helper to convert structured analysis to a markdown string for chat display
const structuredAnalysisToText = (analysis: StructuredAnalysis): string => {
    let text = `**${analysis.title}**`;
    analysis.sections.forEach(section => {
        // Add newlines for spacing between sections
        text += `\n\n**${section.subtitle}**\n${section.content}`;
    });
    return text;
};

export const getChatResponse = async (history: { role: string, parts: any[] }[], newMessage: string, imageFiles: File[]): Promise<string> => {
    const ai = getGeminiAI();
    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

    const currentMessageParts = [{ text: newMessage }, ...imageParts];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [...history, { role: 'user', parts: currentMessageParts }],
        config: {
            systemInstruction: `你是一位经验丰富、善于引导的老师，正在与一位同学进行在线聊天辅导。
你的任务是：
1. 以老师的身份，用简洁明了、亲切的口吻与同学对话。避免啰嗦。
2. 分析同学的问题，并提供结构化的、一步一步的启发式指导。**不要直接给出答案**。
3. 你的回复必须是一个JSON对象，严格遵循以下 schema。
4. 在 content 中，使用 markdown 的 **粗体** 语法来强调关键概念。`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "为你的回复起一个简短的标题" },
                    sections: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                subtitle: { type: Type.STRING, description: "步骤或要点的小标题" },
                                content: { type: Type.STRING, description: "对步骤或要点的详细说明" }
                            },
                            required: ["subtitle", "content"]
                        }
                    }
                },
                required: ["title", "sections"]
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as StructuredAnalysis;
        return structuredAnalysisToText(result);
    } catch (e) {
        console.error("Failed to parse Gemini response for chat as JSON", e);
        // Fallback to plain text if parsing fails, so the user still gets a response.
        return response.text || "抱歉，我好像出了一点小问题，没能理解我的思路。可以再说一遍吗？";
    }
}