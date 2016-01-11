package com.practice.graphQL

import com.practice.domain.{Book, BookCreationModel}
import com.practice.services.BookService
import sangria.schema._

object SchemaDefinition {
  val BookType = ObjectType(
    "book",
    "An entity of book.",
    fields[Unit, Book](
      Field("id", StringType,
        Some("The id of the book."),
        resolve = _.value._id),
      Field("title", StringType,
        Some("The title of the book."),
        resolve = _.value.title),
      Field("desc", OptionType(StringType),
        Some("The description of the book."),
        resolve = _.value.desc),
      Field("author", StringType,
        Some("The author of book."),
        resolve = _.value.author),
      Field("publisher", StringType,
        Some("The publisher of book."),
        resolve = _.value.publisher),
      Field("ISBN", LongType,
        Some("The international standard book number of book."),
        resolve = _.value.ISBN)
    ))

  val ID = Argument("id", StringType, description = "id of the book")
  val TitleArg = Argument("title", StringType, description = "title of the book")
  val DescArg = Argument("desc", StringType, description = "description of the book")
  val AuthorArg =  Argument("author", StringType, description = "author of the book")
  val PublisherArg =  Argument("publisher", StringType, description = "publisher of the book")
  val ISBNArg =  Argument("ISBN", IntType, description = "ISBN of the book")
  val KeywordArg = Argument("keyword", OptionInputType(StringType), description = "keyword of filtering books")

  val Query = ObjectType(
    "Query", fields[BookService, Unit](
      Field("book", OptionType(BookType),
        arguments = ID :: Nil,
        resolve = ctx => ctx.ctx.getBook(ctx arg ID)),
      Field("books", ListType(BookType),
        arguments = KeywordArg :: Nil,
        resolve = ctx => ctx.ctx.getBooks(ctx argOpt KeywordArg))
    ))

  val Mutation = ObjectType("MutationRoot", fields[BookService, Unit](
    Field("addBook", OptionType(BookType),
      arguments = TitleArg :: DescArg :: AuthorArg :: PublisherArg :: ISBNArg :: Nil,
      resolve = ctx => ctx.ctx.addBook(
        BookCreationModel(ctx arg TitleArg, ctx arg DescArg, ctx arg AuthorArg, ctx arg PublisherArg, ctx arg ISBNArg))),
      Field("updateBook", OptionType(BookType),
        arguments = ID :: TitleArg :: DescArg :: AuthorArg :: PublisherArg :: ISBNArg :: Nil,
        resolve = ctx => ctx.ctx.updateBook(Book(ctx arg ID, ctx arg TitleArg, ctx arg DescArg, ctx arg AuthorArg, ctx arg PublisherArg, ctx arg ISBNArg))),
      Field("deleteBook", OptionType(IDType),
        arguments = ID :: Nil,
        resolve = ctx => ctx.ctx.deleteBook(ctx arg ID))
    ))

  val BookSchema = Schema(Query, Some(Mutation))
}
