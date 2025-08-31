// services/translationService.js
const axios = require('axios');


async function translateText(text, targetLang) {
  const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  try {
    const { data } = await axios.post(url, {
      q: text,
      target: targetLang
    });
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation API error:", error.response?.data || error.message);
    throw new Error('Translation service failed');
  }
}

module.exports = { translateText };


