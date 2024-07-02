import { BaseController } from "./baseController";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

export class ShoppingBagController extends BaseController {
    constructor() {
        this.bag = localStorage.getItem('bag') ? localStorage.getItem('bag') : {};
        this.total = localStorage.getItem('price') ? localStorage.getItem('price') : 0;
    }

    updateLocalStorage() {
        localStorage.setItem('price', Object.keys(this.bag).reduce((acc, key) => acc + this.bag[key].price * this.bag[key].amount, 0));
        localStorage.setItem('bag', this.bag);
    }
     // Implement methods specific to the shopping bag controller here
    update(req, res) {
        item = req.item;
        this.bag[item.id] = item;
        this.updateLocalStorage()
    }

    delete(req, res) {
        item = req.item;
        if (!this.bag[item.id]) {
            res.status(500).send('Item not found in shopping bag')
        }
        this.bag = Object.filter(this.bag, key => key !== item.id);
        this.updateLocalStorage()
    }

    
    async checkout(res, req) {
        // Implement logic to checkout the shopping bag
        try {
            // charge the user
            this.total = localStorage.getItem('price');
            await stripe.paymentIntents.create({
                amount: this.total * 100,
                currency: 'usd',
                payment_method_types: ['card'],
                description: 'Payment for shopping bag',
            })

            if (stripe.paymentIntents.status === 'succeeded') {
                localStorage.removeItem('price');
                this.bag = [];
            }

            await stripe.transfers.create({
                amount: this.total * 100, // $3.00 in cents
                currency: 'usd',
                destination: 'KFC_STRIPE_ACCOUNT_ID',
                description: 'Transfer for KFC order',
              });

        
        }
        catch (error) {
            res.status(500).send('Error processing payment');
        }
    }

}