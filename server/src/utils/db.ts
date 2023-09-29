require("dotenv").config()
import mongoose from "mongoose";

const databaseURI: string = process.env.DB_URI || ""

const connectDatabse = async () => {
    try {
       const data =  await mongoose.connect(databaseURI)
       console.log(`Database connected with ${data.connection.host}`)
    } catch (error:any) {
        console.log(error?.message)
        setTimeout(()=>connectDatabse(), 5000)
    }
}

export default connectDatabse