package mocker

import smoke._
import akka.actor._
import akka.pattern._
import akka.util.Timeout
import com.typesafe.config.ConfigFactory
import smoke.Response

object Requests

object Mocker extends Smoke {
  val staticAssets = system.actorOf(StaticAssets(config.getString("smoke.static-assets.public-dir")))

  val dynamicResponder = system.actorOf(Props[DynamicResponder], "DynamicResponder")
  val proxy = system.actorOf(Props[Proxy], "Proxy")

  var learning = false

  onRequest {
    case GET(Path(Seg("static" :: path)))     ⇒ (staticAssets ? path.mkString("/", "/", "")).mapTo[Response]
    case GET(Path("/assets/ico/favicon.png")) ⇒ reply(Response(NotFound))
    case x                                    ⇒ (proxy ? x).mapTo[Response]
  }

  onError {
    case e: Exception ⇒
      Response(InternalServerError, body = e.toString)
  }
}

class Proxy extends Actor {
  var queue = Seq[(ActorRef, Request)]()
  var responseHistory = Seq[Response]()

  def makeHistory(resp: Response) {
    val history = if (responseHistory.size > 5) responseHistory.tail else responseHistory
    responseHistory = history :+ resp
  }

  def receive() = {
    case GET(Path("/history")) ⇒
      val jsonResponses = responseHistory.map {
        case resp ⇒
          s"""{ "code": "${resp.statusCode}", "body": "${resp.body}" }"""
      }
      sender ! Response(Ok, body = jsonResponses.mkString("[", ",", "]"), headers = Seq("Content-Type" -> "application/json"))

    case GET(Path("/requests")) ⇒
      val jsonRequests = queue.map {
        case (ref, request) ⇒
          val headers = request.headers.map { case (k, v) ⇒ s""" "$k": "$v" """ } mkString ("{", ",", "}")
          val name = ref.path.toString.split('$').last
          s"""{ "name": "$name", "method": "${request.method}", "path": "${request.path}", "body": "${request.body}", "headers": $headers }"""
      }
      sender ! Response(Ok, body = jsonRequests.mkString("[", ",", "]"), headers = Seq("Content-Type" -> "application/json"))

    case r @ POST(Path(Seg("requests" :: path))) ⇒
      val actorPath = path.mkString("/")
      queue.find(_._1.path.toString.split('$').last == actorPath) match {
        case Some(pair) ⇒
          val code = r.params("code")
          val resp = Response(ResponseStatus(code.toInt, ""), body = r.body)
          makeHistory(resp)
          pair._1 ! resp
          queue = queue.filterNot(_ == pair)
          sender ! Response(Ok)
        case _ ⇒
          sender ! Response(NotFound)
      }

    case r: Request ⇒ queue = queue :+ (sender, r)
  }
}

class DynamicResponder extends Actor {
  val mapping = collection.mutable.Map[String, Route]()

  def receive() = {
    case r @ POST(Path("/routes")) & Params(params) ⇒
      val path = params("path")
      val method = params("method").toUpperCase
      mapping += (path -> Route(path, Response(Ok, body = "New route !!")))
      sender ! Response(Ok)

    case DELETE(Path(Seg("routes" :: path))) ⇒ mapping -= path.mkString("/", "/", "")

    case GET(Path("/routes")) ⇒
      sender ! Response(Ok, body = mapping.toString)

    //Rest of the request are dynamic
    case x: Request ⇒ sender ! route(x).getOrElse(Response(NotFound))
  }

  def route(r: Request): Option[Response] = {
    mapping.get(r.path) match {
      case Some(Route(_, response, method, params, headers)) ⇒
        if (!method.isDefined || method == Some(r.method)
          && !params.isDefined || params == Some(r.params)
          && !headers.isDefined || params == Some(r.headers)) {
          Some(response)
        } else None
      case _ ⇒
        None
    }
  }
}

case class Route(path: String, response: Response, method: Option[String] = None, params: Option[Map[String, String]] = None, headers: Option[Map[String, String]] = None)
