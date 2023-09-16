const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
router.post('/create-payment-intent', verifyJWT, async (req, res) => {
    const { price } = req.body;
    if (!price || price === 0 || price == null) {
        return res.json({ error: 'Missing price in request body' });
    }
    const amount = parseInt(price) * 100;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
})
// Post payment info to database
router.post('/post-payment-info', async (req, res) => {
    const paymentInfo = req.body;
    console.log(paymentInfo)
    const paymentCollection = req.mongo.paymentCollection;
    if (!paymentInfo) {
        return res.json({ error: 'Missing payment info in request body' });
    }
    try {
        const result = await paymentCollection.insertOne(paymentInfo);
        res.send(result);
    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }

})




module.exports = router;