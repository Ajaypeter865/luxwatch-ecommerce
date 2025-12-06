const express = require('express')

const router = express.Router()

const { proctedAuth } = require('../../middlewares/auth')

const {
    getStripePayment,
    stripeWebhook,
    stripeSuccess,
} = require('../../controllers/user/stripeControllers');

// 1️⃣ Create Stripe session
router.get('/order/payment/:orderId', proctedAuth, getStripePayment);

// 2️⃣ Stripe Webhook (RAW BODY IMPORTANT)
router.post('/stripe/webhook', 
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

// 3️⃣ Success URL
router.get('/order/success/:sessionId', proctedAuth, stripeSuccess);

module.exports = router;