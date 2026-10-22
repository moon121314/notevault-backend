require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5001;

(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
    
    await connectDB(process.env.MONGO_URI);
    
    app.listen(PORT, () => console.log(`NoteVault API running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1); 
  }
})();