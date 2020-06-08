'use strict'

const express = requires('express');
const app = express();

require('dotenv').config();
app.use(express.static('./public'));

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})