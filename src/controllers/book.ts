import BookModel, { BookDoc } from "@/models/book";
import { CreateBookRequestHandler, UpdateBookRequestHandler } from "@/types";
import { uploadBookToLocalDir, UploadCoverToCloudinary } from "@/utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import { isValidObjectId, ObjectId, Types } from "mongoose";
import slugify from "slugify";
import AuthorModel from "@/models/author";
import path from "path";
import fs from "fs";
import cloudinary from "@/cloud/cloudinary";
import { RequestHandler } from "express";
import UserModel from "@/models/user";
import HistoryModel, { Settings } from "@/models/history";

export const createNewBook: CreateBookRequestHandler = async (req, res) => {
  const { body, files, user } = req;
  const {
    title,
    description,
    genre,
    language,
    fileInfo,
    price,
    publicationName,
    publishedAt,
    uploadMethod,
  } = body;

  const { cover, book } = files;

  const newBook = new BookModel<BookDoc>({
    title,
    description,
    genre,
    language,
    fileInfo: { size: formatFileSize(fileInfo.size), id: "" },
    price,
    publicationName,
    publishedAt,
    slug: "",
    author: new Types.ObjectId(user.authorId),
  });

  newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
    lower: true,
    replacement: "-"
  })

  const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`,{
    lower: true,
    replacement: "-"
  });

  if(uploadMethod === 'local' ){

  if(!book || Array.isArray(book) || book.mimetype !=='application/epub+zip'){
    return sendErrorResponse({
      message: "Invalid book file!",
      status: 422,
      res
    })
  }

  
  if(cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")){
    // if you are using cloudinary 
   newBook.cover = await UploadCoverToCloudinary(cover);

  }

  uploadBookToLocalDir(book, uniqueFileName)
  }
  newBook.fileInfo.id = uniqueFileName;
  
  await AuthorModel.findByIdAndUpdate(user.authorId, { $push: { books: newBook._id } });
  await newBook.save()
  res.send({})

};

export const updateBook: UpdateBookRequestHandler = async (req, res) => {
  const { body, files, user } = req;
  const {
    title,
    description,
    genre,
    language,
    fileInfo,
    price,
    publicationName,
    publishedAt,
    uploadMethod,
    slug
  } = body;

  const {cover, book: bookFiles } = files;
 const book = await BookModel.findOne({slug, author: user.authorId})

 if(!book){
  return sendErrorResponse({
    message: "Book not found!",
    status: 404,
    res
  })
 }
 book.title = title;
 book.description = description;
 book.publicationName = publicationName;
 book.language = language;
 book.genre = genre;
 book.publishedAt = publishedAt;
 book.price = price;

 if(uploadMethod === "local"){
  if(bookFiles && !Array.isArray(bookFiles) && bookFiles.mimetype === 'application/epub+zip'){
      // remove old book from storage
  const uploadPath = path.join(__dirname, '../books')
  const oldBookPath = path.join(uploadPath, book.fileInfo.id);
  if (!fs.existsSync(oldBookPath)) return sendErrorResponse({
    message: "Book not found!",
    status: 404,
    res
  })
  fs.unlinkSync(oldBookPath);
  // upload new book
  const newFileName = slugify(`${book._id} ${book.title}.epub`,{
    lower: true,
    replacement: "-"
  });
  const newFilePath = path.join(uploadPath, newFileName);
  const file = fs.readFileSync(bookFiles.filepath)
  fs.writeFileSync(newFilePath, file);
  book.fileInfo = {
    id: newFileName,
    size: formatFileSize(fileInfo?.size || bookFiles.size)
  };
  }

  if(cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")){
    // remove old file if exist in cloudinary
    if(book.cover?.id) {
      await cloudinary.uploader.destroy(book.cover.id);
    }
   book.cover = await UploadCoverToCloudinary(cover);

  } 
 }
 await book.save()
 res.send()
  }
  interface PopulatedBooks {
    cover?: {
      url: string;
      id: string;
    };
    _id: ObjectId;
    author: {
      _id: ObjectId;
      name: string;
      slug: string;
    };
    title: string;
    slug: string;
  }
  export const getAllPurchasedBooks: RequestHandler = async (req, res) => {
    const user = await UserModel.findById(req.user.id).populate<{
      books: PopulatedBooks[];
    }>({
      path: "books",
      select: "author title cover slug",
      populate: { path: "author", select: "slug name" },
    });
    if (!user) return res.json({ books: [] });
    res.json({
      books: user.books.map((book) => ({
        id: book._id,
        title: book.title,
        cover: book.cover?.url,
        slug: book.slug,
        author: {
          id: book.author._id,
          name: book.author.name,
          slug: book.author.slug,
        },
      })),
    });
  }; 

  export const getPublicBookDetails: RequestHandler = async (req, res) => {
  const book = await BookModel.findOne({slug: req.params.slug })
    .populate<{author: PopulatedBooks["author"]}>({path: "author", select: "name slug" });
    if(!book) return sendErrorResponse({
      message: "Book not found!",
      status: 404,
      res
    })
    const {_id, title, description, cover, author, slug, price: {mrp, sale}, genre, language, publicationName, publishedAt, fileInfo, averageRating} = book
    res.json({
      book: {
       id: _id,
       title, genre, slug, description, cover: cover?.url, language, publicationName, publishedAt: publishedAt.toISOString().split("T")[0], fileInfo,
       rating: averageRating?.toFixed(1),
       price:{
        mrp: (mrp / 100).toFixed(2),
        sale: (sale / 100).toFixed(2)
       },
       author:{
        id: author._id,
        name: author.name,
        slug: author.slug
       }
      },
    })
  }

  export const getBookByGenre: RequestHandler = async (req, res) => {
   const books = await BookModel.find({genre: req.params.genre}).limit(5)

   res.json({
    books: books.map((book) => {
      const {_id, title, cover, averageRating, slug, genre, price: {mrp, sale}} = book
      return {
          id: _id,
          title, genre, slug, cover: cover?.url,
          rating: averageRating?.toFixed(1),
          price:{
           mrp: (mrp / 100).toFixed(2),
           sale: (sale / 100).toFixed(2)
          }
      }
    })
   })
      
  }

  export const generateBookAccessUrl: RequestHandler = async (req, res) => {
    const {slug} = req.params
   const book = await BookModel.findOne({slug})
   if(!book) return sendErrorResponse({
    message: "Book not found!",
    status: 404,
    res
   })
   const user = await UserModel.findOne({_id: req.user.id, books: book._id})
   if(!user) return sendErrorResponse({
    message: "User not found!",
    status: 404,
    res
   })

   const history = await HistoryModel.findOne({reader: req.user.id, book: book._id})
   const settings: Settings = {
    lastLocation: "",
    highlights: []
   }
   if(history){
    settings.highlights = history.highlights.map(h => ({fill: h.fill, selection: h.selection}));
    settings.lastLocation = history.lastLocation
   }
   res.json({settings,
    url: `${process.env.BOOK_API_URL}/${book.fileInfo.id}`,
  })
}

interface recommendedBooks{
  id: string;
  title: string;
  genre: string;
  slug: string;
  cover?: string;
  rating?: string;
  price: {
      mrp: string;
      sale: string;
  };
}

export interface AggregationResult {
  _id: ObjectId
  title: string
  slug: string
  genre: string
  price:{
  mrp: number
  sale: number
  _id: ObjectId
  }
  cover?: {
    url: string
    id: string
    _id: ObjectId
  }
  averageRatings?: number
}

  export const getRecommendedBooks: RequestHandler = async (req, res) => {
    const {bookId} = req.params
    if(!isValidObjectId(bookId)){
      return sendErrorResponse({
        message: "Invalid book id!",
        status: 400,
        res
      })
    }
   const book = await BookModel.findById(bookId)
   if(!book){
    return sendErrorResponse({
      message: "Book not found!",
      status: 404,
      res
    })
   }
  const recommendedBooks = await BookModel.aggregate<AggregationResult>([{
     $match:{genre: book.genre, _id: {$ne: book._id}}} ,
     {$lookup:{
      localField: "_id",
      from: "reviews",
      foreignField: "book",
      as: "reviews"
     }},
     {
      $addFields: {
        averageRating: {$avg: "$reviews.rating"}
      }
     },
     {
      $sort:{averageRating: -1}
     },
     {
      $limit: 5
     },
     {
      $project:{
        _id: 1,
        title: 1,
        slug: 1,
        genre: 1,
        price: 1,
        cover: 1,
        averageRating: 1,
       }
     }
    ])
   const result = recommendedBooks.map<recommendedBooks>((book) => ({
    id: book._id.toString(),
    title: book.title,
    genre: book.genre,
    slug: book.slug,
    price: {
      mrp: (book.price.mrp / 100).toFixed(2),
      sale: (book.price.sale / 100).toFixed(2),
    },
    cover: book.cover?.url,
    rating: book.averageRatings?.toFixed(1)
   }))
   res.json(result)
  }
  