package com.practice

import com.practice.services.BookService
import com.twitter.finatra.http.routing.HttpWarmup
import com.twitter.finatra.httpclient.RequestBuilder._
import com.twitter.finatra.utils.Handler
import javax.inject.Inject

class WarmupHandler @Inject()(httpWarmup: HttpWarmup, bookSrv: BookService) extends Handler {
  override def handle() = {
    bookSrv.checkAndInitIndex
  }
}