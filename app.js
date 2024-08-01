const express = require('express');
const path = require('path');
const cors = require('cors');
const {initialDBConnection, getRank, insertRank, close  } = require('./connectDB');

const app = express();

// 
app.use(cors()); // for feautre deployment
app.set('view engine', 'ejs'); // present ejs files to make leverage of express server
app.use(express.static('public')); 
app.use(express.json());  // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

db = initialDBConnection()

// Routers
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/leaderboard/:message?', async (req, res) => {
    const rank = await getRank();
    const message = req.query.message;
    let messageToSend ;
    if (message === 'connectionError') 
         messageToSend = message;
    else
         messageToSend = '';
    if (rank.length ==0)
        rank.push({'name':'No Records Yet', 'score':'-'})
    res.render('leaderboard', { table: rank, message: messageToSend });
});

app.post('/insertDB', async (req, res) => {
    try {
        let request = req.body;
        if (Object.values(request).some(value => value === '')) {
            return res.status(400).send('Recieved wrong input');
        }
        //time size is some scaiiling of the time instead make calculation
        //this attribute for easy sort
        request['timeSize']= Number(request['score'].replace(':',''))
        insertRank(request)
        res.status(200).send('Test document inserted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting test document');
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Close the connection before shutdown
process.on('SIGINT', async () => {
    await close();
    process.exit(0);
  });