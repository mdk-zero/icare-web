import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/app/lib/auth/session';
import { getSupabaseAdmin } from '@/app/lib/supabase/server';

function isFacultyOrAdmin(role: string | undefined): boolean {
  return role === 'faculty' || role === 'admin';
}

interface PatientContext {
  name: string;
  age: number;
  gender: string;
  room_number: string;
  diagnosis: string;
  admission_date: string;
  vital_signs: Record<string, unknown>;
  labs: Record<string, unknown>;
  mimic_id: string;
}

function invalidSessionResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function buildPrompt(userPrompt: string, patient?: PatientContext | null): string {
  const patientBlock = patient
    ? `
Use the following MIMIC-IV patient record as the basis for the scenario:

- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Room: ${patient.room_number}
- Diagnosis: ${patient.diagnosis}
- Admission Date: ${patient.admission_date}
- Vital Signs: ${JSON.stringify(patient.vital_signs, null, 2)}
- Labs: ${JSON.stringify(patient.labs, null, 2)}
- MIMIC ID: ${patient.mimic_id}
`
    : '';

  return `You are a clinical nursing education expert. Create a realistic simulation scenario for nursing students based on the faculty request below.

Faculty request: "${userPrompt.replace(/"/g, '\\"')}"
${patientBlock}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "title": "string",
  "description": "string",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "category": "string",
  "patient_case": {
    "chief_complaint": "string",
    "vitals": {
      "heart_rate": number,
      "blood_pressure": "string",
      "temperature": number,
      "respiratory_rate": number,
      "oxygen_saturation": number
    },
    "medical_history": "string",
    "physical_exam": "string",
    "diagnosis": "string",
    "treatment_plan": "string"
  },
  "learning_objectives": ["string", "string", "string"]
}

Guidelines:
- If a patient record is provided, base vitals/diagnosis on it but craft a coherent teaching case.
- Difficulty should match clinical complexity.
- Learning objectives must be measurable and nursing-focused.
- Keep the scenario clinically plausible and safe for educational use.`;
}

async function fetchPatient(supabase: ReturnType<typeof getSupabaseAdmin>, patientId: string): Promise<PatientContext | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('name, age, gender, room_number, diagnosis, admission_date, vital_signs, labs, mimic_id')
    .eq('id', patientId)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as PatientContext;
}

async function callGemini(prompt: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    candidates?: {
      content?: {
        parts?: { text?: string }[];
      };
      finishReason?: string;
    }[];
    error?: { message?: string };
  };

  if (json.error?.message) {
    throw new Error(`Gemini API error: ${json.error.message}`);
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  if (json.candidates?.[0]?.finishReason && json.candidates[0].finishReason !== 'STOP') {
    throw new Error(`Gemini generation stopped: ${json.candidates[0].finishReason}`);
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

function sanitizeScenario(input: Record<string, unknown>): {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  patient_case: Record<string, unknown>;
  learning_objectives: string[];
} {
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  const difficulty =
    typeof input.difficulty === 'string' && validDifficulties.includes(input.difficulty)
      ? input.difficulty
      : 'intermediate';

  const learningObjectives = Array.isArray(input.learning_objectives)
    ? input.learning_objectives.filter((o): o is string => typeof o === 'string')
    : [];

  return {
    title: typeof input.title === 'string' ? input.title : 'AI Generated Scenario',
    description: typeof input.description === 'string' ? input.description : '',
    difficulty,
    category: typeof input.category === 'string' ? input.category : 'AI Generated',
    patient_case: input.patient_case && typeof input.patient_case === 'object'
      ? (input.patient_case as Record<string, unknown>)
      : {},
    learning_objectives: learningObjectives.length > 0
      ? learningObjectives
      : ['Demonstrate clinical assessment skills', 'Apply evidence-based interventions'],
  };
}

export async function POST(request: NextRequest) {
  const session = await readSession();
  if (!session) return invalidSessionResponse();
  if (!isFacultyOrAdmin(session.role)) return forbiddenResponse();

  let body: { prompt?: string; patient_id?: string };
  try {
    body = (await request.json()) as { prompt?: string; patient_id?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let patient: PatientContext | null = null;
    if (typeof body.patient_id === 'string' && body.patient_id.trim()) {
      patient = await fetchPatient(supabase, body.patient_id.trim());
    }

    const generated = await callGemini(buildPrompt(prompt, patient));
    const scenario = sanitizeScenario(generated);

    return NextResponse.json({ scenario });
  } catch (err) {
    console.error('Generate AI scenario failed', err);
    const message = err instanceof Error ? err.message : 'Unable to generate scenario';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
