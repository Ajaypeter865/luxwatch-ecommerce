const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderModel = require('../../models/order');
const cartModel = require('../../models/cart');
const productModel = require('../../models/products');



const getStripePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);

        if (!order) return res.redirect('/checkout');
        if (order.paymentMethod !== 'Card') return res.redirect('/checkout');

        // Stripe line items
        const line_items = order.orderItems.map(item => ({
            price_data: {
                currency: "inr",
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items,
            metadata: {
                orderId: order._id.toString(),
                userId: order.user.toString()
            },
            success_url: `${req.protocol}://${req.get('host')}/order/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
        });

        order.stripeSessionId = session.id;
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        return res.redirect(303, session.url);

    } catch (err) {
        console.error("Stripe Session Error:", err);
        res.redirect('/checkout');
    }
};


const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log("Webhook signature failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const orderId = session.metadata.orderId;

                const order = await orderModel.findById(orderId);
                if (order && order.paymentStatus !== "Paid") {

                    order.paymentStatus = "Paid";
                    order.orderStatus = "Pending";
                    order.stripePaymentIntentId = session.payment_intent;
                    await order.save();

                    // DECREMENT STOCK
                    for (const item of order.orderItems) {
                        await productModel.findByIdAndUpdate(
                            item.productId,
                            { $inc: { stock: -item.quantity } }
                        );
                    }

                    // CLEAR CART
                    await cartModel.findOneAndDelete({ user: order.user });
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const session = event.data.object;
                const orderId = session.metadata?.orderId;
                if (orderId) {
                    await orderModel.findByIdAndUpdate(orderId, {
                        paymentStatus: 'Failed'
                    });
                }
                break;
            }
        }
    } catch (err) {
        console.error("Webhook Handling Error:", err);
        return res.sendStatus(500);
    }

    res.json({ received: true });
};


const stripeSuccess = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        const orderId = session.metadata.orderId;
        const order = await orderModel.findById(orderId);

        if (!order) return res.redirect('/');

        // If webhook didn't arrive yet
        if (order.paymentStatus !== "Paid") {
            order.paymentStatus = "Paid";
            order.orderStatus = "Pending";
            await order.save();
        }

        res.render('user/orderSuccess', { order });

    } catch (err) {
        console.error("Success Route Error:", err);
        res.status(500).send("Error processing payment.");
    }
};



module.exports = {
    getStripePayment,
    stripeWebhook,
    stripeSuccess
}