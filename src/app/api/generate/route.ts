import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { text } = await generateText({
      model: google('gemini-2.5-flash'), 
      prompt: `
        Eres un Entrenador Personal de élite.
        DATOS CLIENTE:
        - Edad: ${data.age}
        - Objetivo: ${data.goal}
        - Nivel: ${data.level}
        - Dónde entrena: ${data.place}
        - Equipo: ${data.equipment || 'Ninguno'}
        - Lesiones: ${data.injuries || 'Ninguna'}

        GENERA UNA RUTINA EN FORMATO MARKDOWN:
        1. # Título Motivador
        2. # Resumen del Plan
        3. ## Rutina (Usa listas con viñetas • para ejercicios)
        4. ## Nutrición
        5. ## Tip Final
        
        Sé conciso, usa negritas y listas.
      `,
    });

  return Response.json({ success: true, routine: text });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error detallado:", errorMessage);
    
    return Response.json(
      { success: false, error: "Error al generar la rutina", details: errorMessage },
      { status: 500 }
    );
  }
}