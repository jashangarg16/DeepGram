const axios = require('axios');

exports.translateText = async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    
    // Debug info
    console.log('Translation request received:');
    console.log('Text:', text);
    console.log('Source language:', sourceLanguage);
    console.log('Target language:', targetLanguage);
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: text is required' 
      });
    }
    
    if (!targetLanguage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: targetLanguage is required' 
      });
    }
    
    // Google Cloud Translation API
    // const response = await axios.post(
    //   `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
    //   {
    //     q: text,
    //     source: sourceLanguage.split('-')[0], // Use language code without region
    //     target: targetLanguage.split('-')[0],
    //     format: 'text'
    //   }
    // );
    // const translatedText = response.data.data.translations[0].translatedText;
    
    
    const translatedText = mockTranslation(text, sourceLanguage, targetLanguage);
    
    res.json({
      success: true,
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Translation failed', 
      details: error.message 
    });
  }
};

function mockTranslation(text, sourceLanguage, targetLanguage) {
  console.log(`Mock translation from ${sourceLanguage} to ${targetLanguage}`);
  return `[Translated from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
}