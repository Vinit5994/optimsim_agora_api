
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB connection URI
const uri = `${process.env.MONGODB_URI}`;
// Database name
const dbName = 'optimism-agora-delegate';

app.get('/', async (req, res) => {
  try {
    let limit = 100;
    let offset = 0;
    let delegates = [];
    let count =0;
    console.log(process.env.TOKEN)
    while (offset <= 102060) {
      const response = await fetch(
        `https://vote.optimism.io/api/v1/delegates?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'accept': 'application/json',
            'mode': 'no-cors',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': `Bearer ${process.env.TOKEN}`,
          },
        }
      );

      const {data} = await response.json();
     
      delegates = delegates.concat(data);
      limit = data.length;
      offset += data.length;
      
      count++;
      console.log(count);
    }

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    // Store each delegate in a separate document
    let count2=0;
      for (const delegate of delegates) {
        
        await db.collection('delegate_info').insertOne(delegate);
        count2++;
        console.log(count2);  
    }

    // Close the MongoDB connection
    await client.close();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
