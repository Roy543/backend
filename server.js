const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ics = require('ics');

const app = express();

// Middleware to handle CORS for all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://date-invite-eight.vercel.app'); // Allow your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // If this is a preflight request, send a response immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(bodyParser.json());

app.post('/send-invite', (req, res) => {
  const { date, userEmail } = req.body;

  // Parse the date string into a Date object
  const parsedDate = new Date(date); // Ensure the date is a Date object

  // Check if the parsed date is valid
  if (isNaN(parsedDate)) {
    return res.status(400).send('Invalid date format');
  }

  const event = {
    start: [
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      parsedDate.getDate(),
      parsedDate.getHours(),
      parsedDate.getMinutes(),
    ],
    duration: { hours: 2, minutes: 0 },
    title: 'Our Cute Date! ❤️',
    description: 'I’m really looking forward to our date! 🥰',
    location: 'Your Favorite Place', // You can replace this with a specific location
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    attendees: [
      { name: 'You', email: 'sahilsas88@gmail.com' }, // Your email
      { name: 'User', email: userEmail }, // User's email
    ],
  };

  ics.createEvent(event, (error, value) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error generating invite');
    }

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sahilsas88@gmail.com',
        pass: 'svsb nccn azqx axcv', // Use app password for security
      },
    });

    const mailOptions = {
      from: 'sahilsas88@gmail.com',
      to: `${userEmail}, sahilsas88@gmail.com`,
      subject: 'Yay! Our Date is Set! 🥳❤️',
      text: `
Hey Marmee!

Guess what? You have officially accepted my date invite, and I couldn’t be more excited! 🥰

We're going to have a date that will make even the cheesiest rom-coms jealous. I have already started practicing my best jokes, and I promise at least some of them will make you laugh (or at least roll your eyes in a good way). Either way, we are gonna have a great time!

Details:

Where: Your Favorite Place (because you deserve the best!)

Bring your awesome self, your lovely smile, and maybe an appetite for some fun surprises!

Can't wait to see you!

Cheers,
Sahil ❤️
      `,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: value,
      },
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email');
      }
      res.send('Invite and email sent successfully!');
    });
  });
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
