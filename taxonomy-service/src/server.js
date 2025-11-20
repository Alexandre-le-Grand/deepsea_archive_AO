import express from 'express';
import dotenv from 'dotenv';
import taxonomyRoutes from './routes/taxonomyRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/taxonomy', taxonomyRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Taxonomy-service running on port ${PORT}`));
