import { app } from "./app";
require("dotenv").config()

const PORT = process.env.PORT || 6000;

app.get('/', (req, res) => {
  res.send('Hello, LMS  App!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
