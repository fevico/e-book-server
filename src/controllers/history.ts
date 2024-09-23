import HistoryModel from "@/models/history";
import { UpdateHistoryRequestHandler } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const updateBookHistory: UpdateHistoryRequestHandler = async (req, res) => {
    const {bookId, highlights, lastLocation, remove} = req.body
   let history = await HistoryModel.findOne({book: bookId, reader: req.user.id })
   if(!history) {
       history = new HistoryModel({highlights, lastLocation, reader: req.user.id, book: bookId})
   }else{
    if(lastLocation) history.lastLocation = lastLocation
    if(highlights?.length && !remove) history.highlights.push(...highlights)
        // Removing highlights
    if(highlights?.length && remove){
       history.highlights = history.highlights.filter((item) =>{
           const highlight = highlights.find(h =>{
                if(h.selection === item.selection){
                    return h
                }
            })
            if(!highlight) return true
        });
    }
   }
   await history.save()
   res.send()
}

export const getBookHistory: RequestHandler = async (req, res) => {
  const {bookId} = req.params
  if(!isValidObjectId(bookId)) return sendErrorResponse({
       res,
    message: "Invalid book id",
    status: 422
  })
  const history = await HistoryModel.findOne({book: bookId, reader: req.user.id})
  if(!history) return sendErrorResponse({
    res,
    message: "No history found",
    status: 404
  })
  const formattedHistory ={
    lastLocation: history.lastLocation,
    highlights: history.highlights.map(h => ({fill: h.fill, selection: h.selection}))
  }
    res.json({history: formattedHistory})
}