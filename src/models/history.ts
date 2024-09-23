import { Model, model, Schema } from "mongoose";
import { ObjectId } from "mongoose";

interface HistoryDoc{
    book: ObjectId,
    reader: ObjectId,
    lastLocation: string,
    highlights:{selection: string, fill: string}[]
}

const historySchema = new Schema<HistoryDoc>({
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    reader: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    lastLocation: String,
    highlights: [{selection: String, fill: String}]
}, {timestamps: true});

const HistoryModel = model("History", historySchema);

export default HistoryModel as Model<HistoryDoc> & {
    
}
;