"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface JournalEntry {
  _id: string;
  userId: string;
  ambience: string;
  text: string;
  emotion: string;
  keywords: string[];
  createdAt: string;
}

interface AnalysisResult {
  emotion: string;
  keywords: string[];
  summary: string;
}

interface Insights {
  totalEntries: number;
  topEmotion: string;
  mostUsedAmbience: string;
  recentKeywords: string[];
}

const ambienceOptions = [
  { value: "forest", icon: "🌲", label: "Forest" },
  { value: "ocean", icon: "🌊", label: "Ocean" },
  { value: "mountain", icon: "🏔️", label: "Mountain" },
  { value: "city", icon: "🌆", label: "City" },
  { value: "night", icon: "🌙", label: "Night" },
];

const emotionEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  calm: "😌",
  excited: "🤩",
  neutral: "😐",
  angry: "😠",
  grateful: "🙏",
};

export default function Home() {
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState("forest");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "entries" | "insights">("write");

  const userId = "123";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get<JournalEntry[]>(`${API_URL}/journal/${userId}`);
      setEntries(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch entries");
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Journal text cannot be empty");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/journal`, {
        userId,
        ambience,
        text,
      });
      setText("");
      fetchEntries();
      setError("");
      setLoading(false);
      setActiveTab("entries");
    } catch (err) {
      setError("Failed to submit entry");
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Enter text to analyze");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post<AnalysisResult>(`${API_URL}/journal/analyze`, { text });
      setAnalysis(res.data);
      setError("");
      setLoading(false);
    } catch (err) {
      setError("Failed to analyze text");
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Insights>(`${API_URL}/journal/insights/${userId}`);
      setInsights(res.data);
      setError("");
      setLoading(false);
      setActiveTab("insights");
    } catch (err) {
      setError("Failed to fetch insights");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-6 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <header className="text-center text-white mb-4">
          <h1 className="text-5xl font-bold drop-shadow-lg">✨ AI Journal</h1>
          <p className="text-gray-300 mt-2">Your personal space for mindful reflection</p>
        </header>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden shadow-lg mb-6">
          {["write", "entries", "insights"].map((tab) => (
            <button
              key={tab}
              onClick={() => (tab === "insights" ? fetchInsights() : setActiveTab(tab as any))}
              className={`flex-1 py-3 font-semibold text-lg transition-colors ${
                activeTab === tab
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab === "write" && "✏️ Write"}
              {tab === "entries" && `📖 Entries (${entries.length})`}
              {tab === "insights" && "📊 Insights"}
            </button>
          ))}
        </div>

        {/* Error & Loading */}
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        {loading && <div className="bg-indigo-500 text-white p-3 rounded animate-pulse">⏳ Loading...</div>}

        {/* Write Tab */}
        {activeTab === "write" && (
          <div className="space-y-4 bg-gray-900 p-6 rounded-2xl shadow-lg text-white">
            <textarea
              placeholder="What's on your mind today?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 p-4 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-wrap gap-2">
              {ambienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAmbience(opt.value)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    ambience === opt.value
                      ? "bg-indigo-500 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={handleSubmit} className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl py-2 font-semibold">
                💾 Save Entry
              </button>
              <button onClick={handleAnalyze} className="flex-1 bg-yellow-500 hover:bg-yellow-600 rounded-xl py-2 font-semibold">
                🔍 Analyze
              </button>
            </div>

            {/* Analysis Result */}
            {analysis && (
              <div className="mt-4 p-4 bg-gray-800 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-2">🧠 AI Analysis</h3>
                <p>
                  <strong>Emotion:</strong> {emotionEmojis[analysis.emotion.toLowerCase()] || "😊"} {analysis.emotion}
                </p>
                <p>
                  <strong>Keywords:</strong>{" "}
                  {analysis.keywords.map((k) => (
                    <span key={k} className="px-2 py-1 bg-indigo-600 rounded-full text-sm mr-2">
                      #{k}
                    </span>
                  ))}
                </p>
                <p>
                  <strong>Summary:</strong> {analysis.summary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Entries Tab */}
        {activeTab === "entries" && (
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-gray-400 text-center py-12">No entries yet. Start writing!</div>
            ) : (
              entries.map((e) => (
                <div key={e._id} className="bg-gray-800 p-4 rounded-2xl shadow-md text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span>
                      {ambienceOptions.find((o) => o.value === e.ambience)?.icon} {e.ambience}
                    </span>
                    <span>{emotionEmojis[e.emotion?.toLowerCase()] || "😊"}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{e.text}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.keywords?.map((k) => (
                      <span key={k} className="text-xs px-2 py-1 bg-indigo-600 rounded-full">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-500 text-white p-4 rounded-2xl shadow-md">
              <p>Total Entries</p>
              <p className="text-2xl font-bold">{insights.totalEntries}</p>
            </div>
            <div className="bg-yellow-500 text-white p-4 rounded-2xl shadow-md">
              <p>Top Emotion</p>
              <p className="text-2xl font-bold">
                {emotionEmojis[insights.topEmotion.toLowerCase()] || "😊"} {insights.topEmotion}
              </p>
            </div>
            <div className="bg-green-500 text-white p-4 rounded-2xl shadow-md">
              <p>Most Used Ambience</p>
              <p className="text-xl font-semibold">
                {ambienceOptions.find((o) => o.value === insights.mostUsedAmbience)?.icon}{" "}
                {insights.mostUsedAmbience}
              </p>
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-2xl shadow-md">
              <p>Recent Keywords</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {insights.recentKeywords.map((k) => (
                  <span key={k} className="text-sm px-2 py-1 bg-indigo-700 rounded-full">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
