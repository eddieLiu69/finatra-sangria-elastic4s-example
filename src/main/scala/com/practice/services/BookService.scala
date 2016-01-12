package com.practice.services

import javax.inject.{Inject, Singleton}

import com.practice.domain.{Book, BookCreationModel}
import com.sksamuel.elastic4s.ElasticDsl.{delete => delete4s, _}
import com.sksamuel.elastic4s._
import com.sksamuel.elastic4s.jackson.ElasticJackson.Implicits._
import com.twitter.finatra.annotations.Flag
import org.elasticsearch.action.update.UpdateResponse

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

@Singleton
class BookService @Inject()
(elasticClient: ElasticClient, @Flag("timeout") timeout: Short) {
  private val _index: String = "library"
  private val _type: String = "book"

  def getBook(id: String) = {
    val req = get id id from _index / _type
    val future = this.elasticClient.execute(req)
    val resp = Await.result(future, timeout.seconds)
    val map = resp.getSourceAsMap
    parseToBook(resp.getId, Some(map))
  }

  def getBooks(keyword: Option[String]) = {
    val req = search in _index / _type query s"*${keyword.getOrElse('*')}*" size 999
    val future = this.elasticClient.execute(req)
    Await.result(future.map(res => res.as[Book]), timeout.seconds).toList
  }

  def addBook(book: BookCreationModel): Book = {
    val future = this.elasticClient.execute(index into _index / _type source book)
    val resp = Await.result(future, timeout.seconds)
    refreshIndex
    Book(resp.getId, book.title, book.desc, book.author, book.publisher, book.ISBN)
  }

  def updateBook(book: Book): Option[Book] = {
    val req = update id book._id in _index / _type source book includeSource
    //    val future = this.client.execute(req).map(rlt => rlt.getGetResult.sourceAsString)
    val resp: UpdateResponse = Await.result(this.elasticClient.execute(req), timeout.seconds)
    val map = resp.getGetResult.sourceAsMap
    refreshIndex
    parseToBook(resp.getId, Some(map))
  }

  def deleteBook(id: String) = {
    val req = delete4s id id from _index -> _type
    val future = this.elasticClient.execute(req) map (res => (res.getId, res.getIndex))
    Await.result(future, timeout.seconds)
    refreshIndex
    id
  }

  private def parseToBook(id: String, map: Option[java.util.Map[String, AnyRef]]): Option[Book] = {
    map match {
      case Some(null) => None
      case Some(map) => Some(Book(id, map.get("title").toString, map.get("desc").toString, map.get("author").toString, map.get("publisher").toString, map.get("ISBN").toString.toInt))
    }
  }

  private def isIndexExists(): Boolean = {
    val req = indexExists(this._index)
    Await.result(this.elasticClient.execute(req), timeout.seconds).isExists
  }

  //refresh data manually
  def refreshIndex() = {
    Await.result(this.elasticClient.execute(refresh index this._index), timeout.seconds)
  }

  def checkAndInitIndex() = {
    if (!this.isIndexExists) {
      this.elasticClient.execute(create index this._index)
    }
  }
}