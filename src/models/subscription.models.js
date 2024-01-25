import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type : Schema.Types.ObjectId,// the one who is subscribing
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId,// the one to whom the 'subscriber' is subscribing
        ref: "User"
    }
    // channel and subscriber both are users
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema);