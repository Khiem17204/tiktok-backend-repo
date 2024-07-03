import express from 'express';
import CartControllerBagController from '../controller/cartController';


app.post('/order', CartController.update);

app.delete('/order', CartController.delete);

app.post('/checkout', CartController.checkout);

