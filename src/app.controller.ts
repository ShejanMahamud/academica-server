import { Body, Controller, Get, Inject, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import Groq from 'groq-sdk';
import { MailtrapClient } from 'mailtrap';
import { getSystemInfoJson } from './utils/system-info';


@Controller()
export class AppController {
  constructor(@Inject('GROQ_CLIENT') private readonly groqClient: Groq, @Inject('MAILTRAP_CLIENT') private readonly mailtrapClient: MailtrapClient) { }

  @Get()
  getHello(@Req() req: Request) {
    return {
      success: true,
      message: 'Server is running',
      data: {
        api_docs: req.protocol + '://' + req.get('host') + '/v1/api/docs',
        health: req.protocol + '://' + req.get('host') + '/v1/api/health',
      },
    };
  }

  @Post('newsletter')
  async newsletter(@Req() req: Request, @Body() body: { language: string }) {
    return this.groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert software engineering educator and content generator. Your task is to create professional, concise, and actionable daily content for a subscription-based newsletter targeting software engineers of all levels.\n.The subscriber's preferred programming language is ${body.language}. Each day, generate one unique software engineering concepts covering topics such as core SWE concepts, design patterns, data structures and algorithms (DSA), system design, coding best practices, and career development.\n\nEach concept should follow this structure:\n1. Concept Name: A clear and professional title.\n2. Explanation: 3–5 sentences clearly explaining the concept.\n3. Code Example or Diagram: Provide a short illustrative code snippet or pseudo-code if relevant.\n4. Real-World Application: Explain where or why this concept is applied in software development.\n5. Optional Exercise or Challenge: A small practice problem to reinforce the concept.\n6. Optional Resources: Links to documentation, articles, or tutorials for further study.\n\nConstraints:\n- Keep each concept concise, professional, and easy to understand.\n- Avoid using casual language, emojis, or unnecessary filler words.\n- Focus on clarity, precision, and practical applicability.\n- Ensure concepts are unique each day; do not repeat previous content.\n- Make the content actionable so that readers can immediately apply or practice the concept.\n\nGenerate the output in a html format suitable for direct inclusion in a daily newsletter, with numbered headings and clear separation between concepts.`,
        },
      ],
      model: "openai/gpt-oss-20b",
    });
  }

  @Get('health')
  getHealth() {
    return {
      success: true,
      message: 'Health check passed',
      data: getSystemInfoJson,
    };
  }
}
