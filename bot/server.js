const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to the mini web app!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});