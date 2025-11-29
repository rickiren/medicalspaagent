import { StateGraph, END } from '@langchain/langgraph';

// Email generation state
const emailState = {
  config: null,
  research: null,
  personalization: null,
  draft: null,
  final: null,
};

// Research node - Gather information about the business
async function researchNode(state) {
  const { config } = state;
  
  // In a real implementation, this would:
  // 1. Scrape the business website
  // 2. Look up industry statistics
  // 3. Find relevant testimonials
  // 4. Research competitor information
  
  const research = {
    businessType: config.businessType,
    industryStats: config.includeStats ? {
      avgResponseTime: '4 hours',
      industryAvg: '0.4 seconds',
      revenueIncrease: '+35%',
      bookingIncrease: '+60%',
    } : null,
    testimonials: config.includeTestimonial ? [
      'Revenue increased by 35% in the first month',
      'Captures leads at 10 PM while I\'m asleep',
    ] : null,
  };
  
  return { research };
}

// Personalization node - Analyze and personalize
async function personalizationNode(state) {
  const { config, research } = state;
  
  const personalization = {
    level: config.personalizationLevel,
    usedElements: [],
    confidence: 0.7,
  };
  
  // Determine personalization elements based on level
  if (config.personalizationLevel === 'high') {
    personalization.usedElements = [
      'Business Name',
      'Business Type',
      'Industry Statistics',
      'ROI Data',
      'Testimonials',
      'Custom Context',
    ];
    personalization.confidence = 0.9;
  } else if (config.personalizationLevel === 'medium') {
    personalization.usedElements = [
      'Business Name',
      'Business Type',
      'Industry Statistics',
    ];
    personalization.confidence = 0.7;
  } else {
    personalization.usedElements = ['Business Name'];
    personalization.confidence = 0.5;
  }
  
  return { personalization };
}

// Draft generation node - Create the email draft
async function draftNode(state) {
  const { config, research, personalization } = state;
  
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  // Build system prompt
  let systemPrompt = `You are an expert cold outreach email writer specializing in B2B sales for AI/technology services. 
Your goal is to write compelling, personalized cold emails that get responses.

Guidelines:
- Keep emails concise (150-200 words)
- Lead with value, not features
- Use ${config.tone} tone
- Personalize based on: ${personalization.usedElements.join(', ')}
- Include a clear call-to-action
- Avoid being too salesy`;

  if (config.customPrompt) {
    systemPrompt += `\n\nAdditional instructions: ${config.customPrompt}`;
  }
  
  // Build user prompt
  let userPrompt = `Write a cold outreach email to ${config.recipientName} at ${config.businessName} (${config.businessType}).

The email should introduce Cynthia.ai, an AI-powered medical spa receptionist that:
- Answers calls 24/7
- Books appointments automatically
- Increases revenue by capturing after-hours leads
- Reduces response time from 4 hours to 0.4 seconds`;

  if (research.industryStats) {
    userPrompt += `\n\nInclude these statistics: ${JSON.stringify(research.industryStats)}`;
  }
  
  if (research.testimonials) {
    userPrompt += `\n\nInclude these testimonials: ${research.testimonials.join(', ')}`;
  }
  
  userPrompt += `\n\nGenerate both a subject line and email body. Format as JSON: {"subject": "...", "body": "..."}`;
  
  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Use Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Parse JSON response
    let emailData;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[1]);
      } else {
        emailData = JSON.parse(content);
      }
    } catch (e) {
      // Fallback: try to parse as plain JSON
      try {
        emailData = JSON.parse(content);
      } catch (e2) {
        // If all parsing fails, create a structured response from the text
        const lines = content.split('\n');
        const subjectLine = lines.find(line => line.toLowerCase().includes('subject')) || `Transform Your ${config.businessType} with AI`;
        emailData = {
          subject: subjectLine.replace(/subject:?\s*/i, '').trim(),
          body: content,
        };
      }
    }
    
    return {
      draft: {
        subject: emailData.subject || `Transform Your ${config.businessType} with AI`,
        body: emailData.body || content,
      },
    };
  } catch (error) {
    console.error('Error generating draft:', error);
    // Fallback email
    return {
      draft: {
        subject: `Transform Your ${config.businessType} with AI`,
        body: `Hi ${config.recipientName},\n\nI noticed ${config.businessName} is a ${config.businessType}, and I thought you might be interested in Cynthia.ai - an AI-powered receptionist that works 24/7 to capture leads and book appointments.\n\nWould you be open to a quick 15-minute demo?\n\nBest regards`,
      },
    };
  }
}

// Final review node - Polish and finalize
async function finalNode(state) {
  const { draft, personalization } = state;
  
  return {
    final: {
      subject: draft.subject,
      body: draft.body,
      personalization,
    },
  };
}

// Build the LangGraph workflow
function buildEmailGraph() {
  const workflow = new StateGraph({
    channels: {
      config: { reducer: (x, y) => y ?? x },
      research: { reducer: (x, y) => y ?? x },
      personalization: { reducer: (x, y) => y ?? x },
      draft: { reducer: (x, y) => y ?? x },
      final: { reducer: (x, y) => y ?? x },
    },
  });
  
  workflow.addNode('research', researchNode);
  workflow.addNode('personalization', personalizationNode);
  workflow.addNode('draft', draftNode);
  workflow.addNode('final', finalNode);
  
  workflow.setEntryPoint('research');
  workflow.addEdge('research', 'personalization');
  workflow.addEdge('personalization', 'draft');
  workflow.addEdge('draft', 'final');
  workflow.addEdge('final', END);
  
  return workflow.compile();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = req.body;
    
    // Validate required fields
    if (!config.recipientName || !config.recipientEmail || !config.businessName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize state
    const initialState = {
      config,
      research: null,
      personalization: null,
      draft: null,
      final: null,
    };
    
    // Run the graph
    const graph = buildEmailGraph();
    const result = await graph.invoke(initialState);
    
    // Return the final email
    return res.status(200).json({
      subject: result.final.subject,
      body: result.final.body,
      personalization: result.final.personalization,
    });
  } catch (error) {
    console.error('Error in email generator:', error);
    return res.status(500).json({ 
      error: 'Failed to generate email',
      details: error.message 
    });
  }
}

