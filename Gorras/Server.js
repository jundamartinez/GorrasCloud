const express = require('express');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

// Servir los archivos de la página web
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Ruta para crear una sesión de pago
app.post('/crear-sesion-de-pago', async (req, res) => {

  if (!stripe) {
    return res.status(500).json({
      error: 'Stripe no está configurado en el servidor.'
    });
  }

  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],

      line_items: [{
        price_data: {
          currency: 'usd',

          product_data: {
            name: 'Gorra Premium',
          },

          unit_amount: 5000,
        },

        quantity: 1,
      }],

      mode: 'payment',

      success_url: `${BASE_URL}/success.html`,

      cancel_url: `${BASE_URL}/cancel.html`,
    });

    res.json({
      id: session.id
    });

  } catch (error) {

    console.error('Error al crear el pago:', error);

    res.status(500).json({
      error: 'No se pudo crear la sesión de pago.'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
