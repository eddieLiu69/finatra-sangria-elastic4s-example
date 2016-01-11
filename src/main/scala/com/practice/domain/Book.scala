package com.practice.domain

case class Book(_id: String, title: String, desc: String, author: String, publisher:String, ISBN: Long)

case class BookCreationModel(title: String, desc: String, author: String, publisher:String, ISBN: Long)
