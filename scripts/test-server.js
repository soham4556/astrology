import express from 'express';
const app = express();
const PORT = 4001;

app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

// Set a timeout to prevent it from running forever if I forget it
setTimeout(() => {
  console.log('Test server timing out...');
  process.exit(0);
}, 60000);
