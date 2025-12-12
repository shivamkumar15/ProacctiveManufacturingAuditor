import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

// Initialize Gemini Client
// Note: In a real production app, you might proxy this through a backend to protect the key.
// For this demo, we assume the environment variable is injected safely or user provided.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const runMultiModalAudit = async (
  videoFile: File | null,
  logData: string,
  blueprintFile: File | null,
  diagnosticGoal: string
): Promise<AuditResult> => {
  const ai = getClient();
  
  // Using gemini-3-pro-preview for advanced multi-modal reasoning
  const model = "gemini-3-pro-preview";

  const parts: any[] = [];

  // 1. Add Video if present
  if (videoFile) {
    try {
      const videoPart = await fileToGenerativePart(videoFile);
      parts.push(videoPart);
    } catch (e) {
      console.error("Error processing video file:", e);
      throw new Error("Failed to process video file.");
    }
  }

  // 2. Add Blueprint Image if present
  if (blueprintFile) {
    try {
      const imagePart = await fileToGenerativePart(blueprintFile);
      parts.push(imagePart);
    } catch (e) {
      console.error("Error processing blueprint file:", e);
      throw new Error("Failed to process blueprint file.");
    }
  }

  // 3. Construct the Agentic Prompt with the 3 distinct steps
  let promptText = "You are an expert Senior Manufacturing Auditor AI. Your task is to execute a multi-modal audit protocol using the provided machine data.\n\n";
  
  // Append Context
  if (logData.trim()) {
    promptText += `--- START SENSOR/LOG DATA ---\n${logData}\n--- END SENSOR/LOG DATA ---\n\n`;
  } else {
    promptText += "Note: No sensor logs provided.\n\n";
  }

  promptText += `Diagnostic Goal (Vibe Code): ${diagnosticGoal || "General System Health Check"}\n\n`;
  
  // Specific Instructions
  promptText += `Process the inputs (Video, Logs, Blueprint) and generate a response by strictly following these three agentic steps:

  Step 1: Anomaly Detection (Target: Video File)
  - Analyze the video file for any abnormal movement, oscillation, smoke, or sound.
  - Provide a timestamped summary of these observed anomalies (e.g., "00:15 - Irregular spindle wobble detected").

  Step 2: Root Cause Analysis (Target: Video + Logs)
  - Cross-reference the detected video anomalies with the specific time and data points in the Sensor/Log Data.
  - Identify correlations between visual events and log metrics (e.g., temperature spikes, vibration Hz, error codes).
  - Determine the definitive root cause of the anomaly (e.g., "Overheating caused by bearing friction").

  Step 3: Prescribed Fix (Target: Blueprint + Goal + Root Cause)
  - Based on the root cause and the Diagnostic Goal, analyze the Machine Blueprint (Image).
  - Identify the exact physical location and part number required for the repair on the schematic.
  - Output this as a numbered list of actionable repair steps.

  Output Format:
  Provide the response in strict JSON format with the following keys. Use Markdown within the strings for formatting.
  - anomaly_detection
  - root_cause_analysis
  - prescribed_fix`;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            anomaly_detection: { type: Type.STRING },
            root_cause_analysis: { type: Type.STRING },
            prescribed_fix: { type: Type.STRING },
          },
          required: ["anomaly_detection", "root_cause_analysis", "prescribed_fix"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const rawResult = JSON.parse(response.text);
    
    // Map snake_case JSON response to camelCase application type
    return {
      anomalyDetection: rawResult.anomaly_detection,
      rootCauseAnalysis: rawResult.root_cause_analysis,
      prescribedFix: rawResult.prescribed_fix
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};