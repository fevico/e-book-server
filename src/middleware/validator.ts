import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { ZodObject, ZodRawShape, ZodType, z } from "zod";

export const emailValidationSchema = z.object({
  email: z
    .string({
      required_error: "Email is missing!",
      invalid_type_error: "Invalid email type!",
    })
    .email("Invalid email!"),
});

export const newUserSchema = z.object({
    name: z
      .string({
        required_error: "Email is missing!",
        invalid_type_error: "Invalid email type!",
      })
      .min(3, "Name must be at least 3 characters long!")
      .trim(),
})

export const newAuthorSchema = z.object({
    name: z
      .string({
        required_error: "Name is missing!",
        invalid_type_error: "Invalid name!",
      })
      .trim()
      .min(3, "Invalid name"),
    about: z
      .string({
        required_error: "About is missing!",
        invalid_type_error: "Invalid about!",
      })
      .trim()
      .min(100, "Please write at least 100 characters about yourself!"),
    socialLinks: z
      .array(z.string().url("Social links can only be list of  valid URLs!"))
      .optional(),
})

export const commonBookSchema = {
  uploadMethod: z.enum(["aws", "local"],{
    required_error: "Please define a valid upload method!",
    message: "upload method has to be aws or local!",
  }),
  title: z.string({
    required_error: "Title is missing!",
    invalid_type_error: "Invalid title!",
  }).trim(),

  description: z.string({
    required_error: "Description is missing!",
    invalid_type_error: "invalid description!",
  }).trim(),

  language: z.string({
    required_error: "Language is missing!",
    invalid_type_error: "invalid language!",
  }).trim(),
  
  publishedAt: z.coerce.date({
    required_error: "Published Date is missing!",
    invalid_type_error: "invalid published date!",
  }),

  publicationName: z.string({
    required_error: "Publication Name is missing!",
    invalid_type_error: "invalid publication name!",
  }).trim(),

  genre: z.string({
    required_error: "Genre Name is missing!",
    invalid_type_error: "invalid genre!",
  }).trim(),

  price: z.string({
    required_error: "Price is missing!",
    invalid_type_error: "invalid price!"
  }).transform((value, ctx) =>{
    try {
      return JSON.parse(value)
    } catch (error) {
      ctx.addIssue({code: 'custom', message: 'Invalid Price Data'})
      return z.NEVER
    }

  }).pipe(
    z.object({
      mrp: z.number({
        required_error: "MRP is missing!",
        invalid_type_error: "Invalid MRP!"
      }).nonnegative("Invalid mrp price!"),
      sale: z.number({
         required_error: "Sale is missing!",
        invalid_type_error: "Invalid sale!"
      }).nonnegative("Invalid sale price!"),
    })
  ).refine((price) =>price.sale <= price.mrp, "Sale price should be less than MRP!"),
 
}

const fileInfo = z
    .string({
      required_error: "File info is missing!",
      invalid_type_error: "Invalid file info!",
    })
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        ctx.addIssue({ code: "custom", message: "Invalid File Info!" });
        return z.NEVER;
      }
    })
    .pipe(
      z.object({
        name: z
          .string({
            required_error: "fileInfo.name is missing!",
            invalid_type_error: "Invalid fileInfo.name!",
          })
          .trim(),
        type: z
          .string({
            required_error: "fileInfo.type is missing!",
            invalid_type_error: "Invalid fileInfo.type!",
          })
          .trim(),
        size: z
          .number({
            required_error: "fileInfo.size is missing!",
            invalid_type_error: "Invalid fileInfo.size!",
          })
          .nonnegative("Invalid fileInfo.size!"),
      })
    )


export const newBookSchema = z.object({
  ...commonBookSchema,
  fileInfo,
})
export const updateBookSchema = z.object({
  ...commonBookSchema,
  slug: z.string({
    message: "Invalid slug!",
  }).trim(),
  fileInfo: fileInfo.optional(),
})

export const newReviewSchema = z.object({
  rating: z.number({
    required_error: "Rating is missing!",
    invalid_type_error: "Invalid rating!",
  }).nonnegative("Rating should be between 1 to 5 0")
  .min(1, "Rating should be greater than 1!")
  .max(5, "Rating should be less than 5!"),
  content: z.string({
    invalid_type_error: "Invalid content!",
  }).optional(),
  bookId: z.string({
    required_error: "Book Id is missing!",
    invalid_type_error: "Invalid book id!",
  }).transform((arg, ctx) =>{
    if(!isValidObjectId(arg)){
      ctx.addIssue({code: 'custom', message: 'Invalid Book Id!'})
      return z.NEVER
    }
    return arg
  })
})

export const historyValidationSchema = z.object({
  bookId:z.string({
    required_error: "Book Id is missing!",
    invalid_type_error: "Invalid book id!",
  }).transform((arg, ctx) =>{
    if(!isValidObjectId(arg)){
      ctx.addIssue({code: 'custom', message: 'Invalid Book Id!'})
      return z.NEVER
    }
    return arg
  }),
  lastLocation: z.string({
    invalid_type_error: "Invalid last location!",
  }).trim().optional(),

  highlights: z.array(
    z.object({
      selection: z.string({
        required_error: "Highlight selection is missing!",
        invalid_type_error: "Invalid highlight selection!",
      }).trim(),
      fill: z.string({
        required_error: "Highlight Fill is missing!",
        invalid_type_error: "Invalid highlight fill!",
      }).trim()
      })
  ).optional(),
  remove: z.boolean({required_error: "Remove is missing", invalid_type_error: "remove must be a boolean value!"})
})


export const validate = <T extends ZodRawShape>(schema: ZodObject<T>): RequestHandler => {
  return (req, res, next) => {

    const result = schema.safeParse(req.body);

    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const errors = result.error.flatten().fieldErrors;
      return res.status(422).json({ errors });
    }
  };
};