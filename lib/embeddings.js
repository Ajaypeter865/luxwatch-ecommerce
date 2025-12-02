// lib/embeddings.js
require('dotenv').config();
const OpenAI = require('openai');
const productModel = require('../models/products');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// create embedding for arbitrary text
async function makeEmbedding(text) {
    if (!text) return null;
    const resp = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
    });
    return resp.data[0].embedding;
}

// ensure a product doc has an embedding; if missing, create & save it.
// Accepts a Mongoose document (not lean()).
async function ensureEmbeddingForProduct(productDoc) {
    try {
        if (!productDoc) return null;
        if (productDoc.embedding && productDoc.embedding.length > 0) return productDoc.embedding;

        const text = `${productDoc.name || ''}. ${productDoc.description || ''}`.trim();
        if (!text) return null;

        const embedding = await makeEmbedding(text);
        if (!embedding) return null;

        productDoc.embedding = embedding;
        await productDoc.save();
        return embedding;
    } catch (err) {
        console.error('ensureEmbeddingForProduct error', err);
        return null;
    }
}

module.exports = { makeEmbedding, ensureEmbeddingForProduct };
