import dotenv from 'dotenv';
dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const PORT = Number(process.env.PORT) || 3000;

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

startServer()
  .then(() => {
    console.log('GCC HR Server Started Successfully');
  })
  .catch((err) => {
    console.error('SERVER STARTUP FAILED:', err);
  });
