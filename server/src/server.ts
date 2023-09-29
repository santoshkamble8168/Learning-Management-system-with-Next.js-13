require("dotenv").config()
import { app } from "./app";
import { connectDatabse } from "./utils";

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDatabse()
});
