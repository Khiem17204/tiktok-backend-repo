import express from 'express';
import ShoppingBagController from '../controller/shoppingBagController';


app.post('/order', ShoppingBagController.update);

app.delete('/order', ShoppingBagController.delete);

app.post('/checkout', ShoppingBagController.checkout);

