// scripts/generateAllEmbeddings.js
require('dotenv').config();
const mongoose = require('mongoose');
const productModel = require('../models/products');
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const DB_URI = process.env.DB_URI;

async function makeEmbedding(text) {
  const resp = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return resp.data[0].embedding;
}

async function batchGenerate() {
  if (!DB_URI) throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const cursor = productModel.find().cursor();
  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      if (doc.embedding && doc.embedding.length > 0) {
        console.log(`Skipping ${doc._id} (already has embedding)`);
        continue;
      }

      const text = `${doc.name || ''}. ${doc.description || ''}`.trim();
      if (!text) {
        console.warn(`No textual content for product ${doc._id} - skipping`);
        continue;
      }

      const embedding = await makeEmbedding(text);
      doc.embedding = embedding;
      await doc.save();
      count++;
      console.log(`Saved embedding for ${doc._id}`);
    } catch (err) {
      console.error('Error embedding product', doc._id, err);
    }
  }

  console.log(`Done. Embeddings generated for ${count} products.`);
  await mongoose.disconnect();
}

batchGenerate().catch(err => {
  console.error(err);
  process.exit(1);
});
