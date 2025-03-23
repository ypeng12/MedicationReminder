require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use('/audio', express.static('public/audio'));

const callRoutes = require('./routes/callRoutes');
const twilioRoutes = require('./routes/twilioRoutes');

app.use('/api', callRoutes);
app.use('/', twilioRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
