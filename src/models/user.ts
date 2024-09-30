import { model, ObjectId, Schema } from "mongoose";

export interface UserDoc{
    _id: ObjectId,
    name?: string,
    email: string,
    role: "user" | "author",
    signedUp: boolean,
    avatar?: {url: string, id: string},
    authorId?: ObjectId,
    books: ObjectId[] //array of book ids
    orders?: ObjectId[]
}


const userSchema = new Schema<UserDoc>({
    name:{
        type: String,
        trim: true
    },
    email:{
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    role:{
        type: String,
        enum: ['user', 'author'],
        default: 'user'
    },
    signedUp:{
        type: Boolean,
        default: false
    },
    avatar:{
        type:Object,
        url: String,
        id: String
    },
    authorId:{
        type:Schema.Types.ObjectId,
        ref: "Author"
    },
    books:[{
        type: Schema.ObjectId,
        ref: "Book"
    }],
    orders:[{
        type: Schema.ObjectId,
        ref: "Order"
    }]

})

const UserModel = model("User", userSchema)
export default UserModel;