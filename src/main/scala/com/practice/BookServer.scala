package com.practice

import com.practice.controllers.{AssetController, BookController}
import com.practice.modules.ElasticClientModule
import com.twitter.finagle.http.{Request, Response}
import com.twitter.finatra.http.HttpServer
import com.twitter.finatra.http.filters.CommonFilters
import com.twitter.finatra.http.routing.HttpRouter
import com.twitter.finatra.logging.filter.{LoggingMDCFilter, TraceIdMDCFilter}
import com.twitter.finatra.logging.modules.Slf4jBridgeModule

object BookServerMain extends BookServer

class BookServer extends HttpServer {
  override def modules = Seq(Slf4jBridgeModule, ElasticClientModule)

  override def configureHttp(router: HttpRouter) {
    router
      .filter[LoggingMDCFilter[Request, Response]]
      .filter[TraceIdMDCFilter[Request, Response]]
      .filter[CommonFilters]
      .add[BookController]
      .add[AssetController]
  }
}