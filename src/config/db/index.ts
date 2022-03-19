import mongoose from 'mongoose';


const DB_URL = `mongodb+srv://${process.env.DB_ACCOUNT}:${process.env.DB_PASSWORD}@cluster0.z3qdj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const connect = async (callback: (error?: Error) => any) => {
  try {
    await mongoose.connect(DB_URL);
    callback();
  } catch (e) {
    if (e instanceof Error) {
      callback(e);
    }
  }
};

export { connect };
