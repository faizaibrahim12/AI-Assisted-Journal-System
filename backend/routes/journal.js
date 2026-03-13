const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const analyzeText = require("../services/llm");

// -------------------------
// 1. Create Journal Entry
// -------------------------
router.post("/", async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { userId, ambience, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "userId and text are required" });
    }

    // Run LLM analysis before saving
    const llmResult = await analyzeText(text);
    console.log('LLM Result:', llmResult);
    
    const parsedResult = JSON.parse(llmResult);
    console.log('Parsed Result:', parsedResult);

    const journal = Journal.create({
      userId,
      ambience: ambience || 'default',
      text,
      emotion: parsedResult.emotion || 'neutral',
      keywords: parsedResult.keywords || [],
    });

    res.json(journal);
  } catch (err) {
    console.error('Create entry error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// 2. Get All Entries for a User
// -------------------------
router.get("/:userId", async (req, res) => {
  try {
    const entries = Journal.findByUserId(req.params.userId);
    res.json(entries);
  } catch (err) {
    console.error('Get entries error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// 3. Analyze Text via LLM
// -------------------------
router.post("/analyze", async (req, res) => {
  try {
    console.log('Analyze request body:', req.body);
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const llmResult = await analyzeText(text);
    console.log('LLM Result:', llmResult);
    
    const parsedResult = JSON.parse(llmResult);
    res.json(parsedResult);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// 4. Insights for a User
// -------------------------
router.get("/insights/:userId", async (req, res) => {
  try {
    const entries = Journal.findByUserId(req.params.userId);

    const totalEntries = entries.length;
    const ambienceCount = {};
    const emotionCount = {};
    const keywordsSet = new Set();

    entries.forEach((e) => {
      ambienceCount[e.ambience] = (ambienceCount[e.ambience] || 0) + 1;
      emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
      e.keywords?.forEach((k) => keywordsSet.add(k));
    });

    const mostUsedAmbience = Object.keys(ambienceCount).sort(
      (a, b) => ambienceCount[b] - ambienceCount[a]
    )[0] || null;

    const topEmotion = Object.keys(emotionCount).sort(
      (a, b) => emotionCount[b] - emotionCount[a]
    )[0] || null;

    res.json({
      totalEntries,
      topEmotion,
      mostUsedAmbience,
      recentKeywords: Array.from(keywordsSet),
    });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
