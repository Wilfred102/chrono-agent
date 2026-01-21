const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
    res.send('Chronos Freelancer Backend is running');
});

// Routes placeholders
app.post('/api/agent/parse', (req, res) => {
    // Call agent.js logic
    res.json({ message: "Agent parse endpoint" });
});

app.get('/api/invoices', (req, res) => {
    // Get invoices from DB
    res.json({ invoices: [] });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
