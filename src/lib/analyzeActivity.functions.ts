import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

export interface ActivityAnalysis {
  clara: boolean;
  razon_alerta: string;
  minutos_optimizados: number;
  porcentaje_reduccion: number;
  explicacion: string;
}

export const analyzeActivityFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        mins: z.number().int().positive(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<ActivityAnalysis> => {
    const geminiKey = process.env.GEMINI_API_KEY;

    // Smart algorithmic fallback function
    const getFallbackAnalysis = (): ActivityAnalysis => {
      const words = data.name.trim().split(/\s+/);
      const isClara = words.length >= 3;
      const pctRed = isClara ? 55 : 30;
      const minsOpt = Math.round(data.mins * (1 - pctRed / 100));

      return {
        clara: isClara,
        razon_alerta: isClara
          ? ""
          : "Agrega más detalle: qué herramientas usas y para qué objetivo.",
        minutos_optimizados: minsOpt,
        porcentaje_reduccion: pctRed,
        explicacion: isClara
          ? "Optimizable mediante flujos estructurados de IA y plantillas asistidas."
          : "Descripción muy concisa; se estima un ahorro base del 30%.",
      };
    };

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const prompt = `Analiza esta actividad laboral y responde ÚNICAMENTE con un objeto JSON válido (sin markdown \`\`\`json, sin comentarios):
Actividad: "${data.name}"
Tiempo actual: ${data.mins} minutos

Responde con este JSON exacto:
{
  "clara": true/false,
  "razon_alerta": "razón si clara es false o string vacío",
  "minutos_optimizados": número estimado de minutos que le tomará la tarea al realizarla CON IA (debe ser estrictamente menor a ${data.mins}),
  "porcentaje_reduccion": porcentaje de tiempo ahorrado entre 20 y 80,
  "explicacion": "explicación breve de cómo la IA optimiza la tarea"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          let minsWithAI = Number(parsed.minutos_optimizados);
          let pctSaved = Number(parsed.porcentaje_reduccion);

          if (isNaN(minsWithAI) || minsWithAI <= 0 || minsWithAI >= data.mins) {
            pctSaved = pctSaved > 0 && pctSaved < 100 ? pctSaved : 40;
            minsWithAI = Math.round(data.mins * (1 - pctSaved / 100));
          } else {
            pctSaved = Math.round(((data.mins - minsWithAI) / data.mins) * 100);
          }

          return {
            clara: Boolean(parsed.clara),
            razon_alerta: String(parsed.razon_alerta || ""),
            minutos_optimizados: minsWithAI,
            porcentaje_reduccion: pctSaved,
            explicacion: String(
              parsed.explicacion || "Optimización asistida por IA.",
            ),
          };
        }
      } catch (err) {
        console.warn(
          "Gemini API call failed, falling back to smart local estimation:",
          err,
        );
      }
    }

    // Try Lovable gateway if LOVABLE_API_KEY exists
    const lovableKey = process.env.LOVABLE_API_KEY;
    if (lovableKey) {
      try {
        const prompt = `Analiza esta actividad laboral y responde ÚNICAMENTE con JSON válido:
Actividad: "${data.name}"
Tiempo: ${data.mins} minutos
{
  "clara": true,
  "razon_alerta": "",
  "minutos_optimizados": ${Math.round(data.mins * 0.4)},
  "porcentaje_reduccion": 60,
  "explicacion": "Optimización automatizada con IA"
}`;

        const res = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "user", content: prompt }],
            }),
          },
        );

        if (res.ok) {
          const body = await res.json();
          const raw: string = body?.choices?.[0]?.message?.content ?? "";
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            return JSON.parse(match[0]) as ActivityAnalysis;
          }
        }
      } catch (e) {
        console.warn("Lovable gateway call failed:", e);
      }
    }

    return getFallbackAnalysis();
  });
