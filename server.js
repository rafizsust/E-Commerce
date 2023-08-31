const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db/config');
const Users = require('./db/users');
const Product = require('./db/products');
const Orders = require('./db/orders');
const Cart = require('./db/carts');
const Jwt = require('jsonwebtoken');
const jwtKey = 'kenakata';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

app.post('/api/users/signup', async (req, res) => {
  console.log('test client');
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Create new user
    const user = new Users({ name, email, password });
    await user.save();

    res.sendStatus(200);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API endpoint to retrieve user data
app.get('/api/users', async (req, res) => {
  try {
    const users = await Users.find({});
    if(users){
      Jwt.sign({users},jwtKey,{expiresIn:"1h"}, (err,token)=>{
        if (err){
          res.send({result: "something went wrong"})
        }
        res.json({users, auth: token});
      })
      
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to retrieve user data
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update user data
app.put('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, contact, deliveryAddress } = req.body;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUserData = {
      name: name || user.name,
      email: email || user.email,
      contact: contact || user.contact,
      deliveryAddress: deliveryAddress || user.deliveryAddress,
    };

    await Users.findByIdAndUpdate(userId, updatedUserData, { new: true });

    res.json({ message: 'User data updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to retrieve all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to retrieve product data
app.get('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to retrieve orders for a specific user
app.get('/api/users/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const order = await Orders.findOne({ _id: userId });
    res.json(order.orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to delete an order
// API endpoint to delete an order
app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body; // Assuming the user's ID is sent in the request body
    console.log('userId',userId);
    console.log('orderId',orderId);
    const user = await Orders.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Filter and remove the order from the user's orders
    console.log('user.orders',user.orders);
    const orderIndex = user.orders.findIndex((order) => order.id.toString() === orderId.toString());
    if (orderIndex !== -1) {
      user.orders.splice(orderIndex, 1);
    }
    console.log(orderIndex);
    console.log(user.orders);
    await user.save();

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// API endpoint to retrieve the user's cart
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      // If cart doesn't exist, create a new one
      cart = new Cart({
        user_id: userId,
        cart: [],
      });
      await cart.save();
    }

    res.json(cart.cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API endpoint to update or create the cart
app.post('/api/carts', async (req, res) => {
  try {
    const { user_id, cart } = req.body;
    console.log(user_id);
    console.log(cart);
    let existingCart = await Cart.findOne({ user_id });

    if (existingCart) {
      // If cart exists, update the items
      existingCart.cart = mergeCartItems(existingCart.cart, cart);
      await existingCart.save();
      res.json(existingCart);
    } else {
      // If cart doesn't exist, create a new cart
      const newCart = new Cart({
        user_id,
        cart,
      });
      await newCart.save();
      res.json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to update the cart
app.put('/api/carts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { cart } = req.body;

    let existingCart = await Cart.findOne({ user_id: userId });

    if (existingCart) {
      // If cart exists, update the items
      existingCart.cart = cart;
      await existingCart.save();
      res.json(existingCart);
    } else {
      res.status(404).json({ error: 'Cart not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/carts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { cart } = req.body;

    let existingCart = await Cart.findOne({ user_id: userId });

    if (existingCart) {
      // If cart exists, update the items
      existingCart.cart = cart;
      await existingCart.save();
      res.json(existingCart);
    } else {
      // If cart doesn't exist, create a new cart
      const newCart = new Cart({
        user_id: userId,
        cart,
      });
      await newCart.save();
      res.json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Helper function to merge cart items
const mergeCartItems = (existingItems, newItems) => {
  for (const newItem of newItems) {
    const existingItemIndex = existingItems.findIndex(
      (item) => item.productId === newItem.productId
    );

    if (existingItemIndex !== -1) {
      existingItems[existingItemIndex].count += newItem.count;
    } else {
      existingItems.push(newItem);
    }
  }

  return existingItems;
};

// Assuming you have the 'Order' model imported

app.post('/api/orders/checkout', (req, res) => {
  const orderData = req.body;
  const { _id, orders } = orderData;

  Orders.findOne({ _id })
    .then((existingOrder) => {
      if (existingOrder) {
        // If an order with the same _id exists, update it
        existingOrder.orders.push(...orders);
        existingOrder.save()
          .then((updatedOrder) => {
            res.status(200).json(updatedOrder);
          })
          .catch((error) => {
            res.status(500).json({ error: 'Failed to update order' });
          });
      } else {
        // If no order with the same _id exists, create a new order
        Orders.create(orderData)
          .then((newOrder) => {
            res.status(201).json(newOrder);
          })
          .catch((error) => {
            res.status(500).json({ error: 'Failed to create order' });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to find order' });
    });
});

function verifyToken(req,res,next){
  let token = req.headers['authorization'];
  if(token) {
    token = token.split(' ')[1];
    console.log(token);
    Jwt.verify(token,jwtKey, (err, valid)=>{
      if(err) {
        res.status(401).send({result: "need a valid token"})
      }
      else {
        next();
      }
    })
  }
  else {
    res.status(403).send({result: "No auth token"})
  }
}

// app.get('/test', async (req, res) => {
//   console.log('testing api');
// });
// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
