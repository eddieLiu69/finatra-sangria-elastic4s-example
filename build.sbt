name := "finatra-sangria-elastic4s-example"

version := "1.0"

scalaVersion := "2.11.7"

parallelExecution in ThisBuild := true

mainClass in Compile := Some("com.practice.BookServerMain")

assemblyJarName in assembly := "finatra-sangria-elastic4s-example.jar"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", xs @ _*) => MergeStrategy.discard
  case x => MergeStrategy.first
}

lazy val versions = new {
  val finatra = "2.1.2"
  val mustache = "0.9.1"
  val logback = "1.0.13"
  val elastic4s = "1.7.4"
  val elastic4sjackson = "1.7.4"
  val sangria = "0.4.3"
  var json4s = "3.2.11"
}

resolvers ++= Seq(
  Resolver.sonatypeRepo("releases"),
  "Twitter Maven" at "https://maven.twttr.com",
  "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/",
  Resolver.url("scala sbt",  url("http://repo.scala-sbt.org/scalasbt/sbt-plugin-releases"))(Resolver.ivyStylePatterns),
  Resolver.url("typesafe ivy",  url("http://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns)
)

libraryDependencies ++= Seq(
  "com.twitter.finatra" %% "finatra-http" % versions.finatra,
  "com.twitter.finatra" %% "finatra-httpclient" % versions.finatra,
  "com.twitter.finatra" %% "finatra-slf4j" % versions.finatra,
  "com.twitter.inject" %% "inject-core" % versions.finatra,
  "com.github.spullara.mustache.java" % "compiler" % versions.mustache,
  "ch.qos.logback" % "logback-classic" % versions.logback,
  "com.sksamuel.elastic4s" %% "elastic4s-core" % versions.elastic4s,
  "com.sksamuel.elastic4s" %% "elastic4s-jackson" % versions.elastic4sjackson,
  "org.json4s" %% "json4s-native" % versions.json4s,
  "org.sangria-graphql" %% "sangria" % versions.sangria
)