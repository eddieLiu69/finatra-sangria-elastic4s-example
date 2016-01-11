package com.practice.controllers

import javax.inject.{Inject, Singleton}

import com.practice.graphQL.SchemaDefinition
import com.practice.services.BookService
import com.practice.views.BookView
import com.twitter.finagle.http.Request
import com.twitter.finatra.http.Controller
import com.twitter.finatra.routing.HttpRouter
import org.json4s.JsonAST.JString
import org.json4s._
import org.json4s.native.JsonMethods._
import sangria.execution.Executor
import sangria.integration.json4s.native.Json4sNativeInputUnmarshaller
import sangria.parser.QueryParser

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.util.{Failure, Success}

@Singleton
class BookController @Inject()(bookService: BookService)() extends Controller {
  val _awaitTimeout = 30.seconds
  val executor = Executor(
    schema = SchemaDefinition.BookSchema,
    userContext = bookService)

  get("/books") { request: Request =>
    BookView()
  }

  get("/api/books") { request: Request =>
    val reqJson = request.getParam("query")

    QueryParser.parse(reqJson) match {
      // query parsed successfully, time to execute it!
      case Success(queryAst) =>
        Await.result(executor.execute(queryAst), _awaitTimeout)

      // can't parse GraphQL query, return error
      case Failure(error) => error.getMessage
    }
  }

  post("/api/books") { request: Request =>
    val reqJson = parse(request.getContentString)
    val JString(mutation) = reqJson \ "mutation"

    QueryParser.parse(mutation) match {
      // query parsed successfully, time to execute it!
      case Success(queryAst) =>
        Await.result(executor.execute(queryAst), _awaitTimeout)

      // can't parse GraphQL query, return error
      case Failure(error) => error.getMessage
    }
  }
}
