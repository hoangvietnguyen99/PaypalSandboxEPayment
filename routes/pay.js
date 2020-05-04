var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AQwkfQFeuPjF_2hQATQBMtFzpRBpvCtiB7XQehwN878clxxlL6GQKPF0TqjBeL-7_n5zlwUC-CIBVnsn',
    'client_secret': 'EF1Z4MAo6VhR88NJ9uDr2L9Gq1pKyEYFI13j9n2vRUYUdfZa7c91ucQ6ekIfHDHvMlwotMzFil0T5OHR'
});

/* GET pay page. */
router.post('/', function(req, res, next) {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/pay/success",
            "cancel_url": "http://localhost:3000/pay/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Dress",
                    "sku": "001",
                    "price": "100.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "100.00"
            },
            "description": "Red Dress for a perfect party night."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                const element = payment.links[i];
                if (element.rel === 'approval_url') {
                    res.redirect(element.href);
                }
            }
        }
    });
});

router.get('/success', function(req, res, next) {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "100.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw(error);
        } else {
            //console.log('Get Payment Response');
            //console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

router.get('/cancel', function(req, res, next) {
    res.send('Cancelled');
});

module.exports = router;
