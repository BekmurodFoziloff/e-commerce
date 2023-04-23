import 'dotenv/config';
import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  logger.debug(`Server listening on port ${PORT}`);
});
