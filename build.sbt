name := "mocker"

organization := "com.codegrande"

scalaVersion := "2.10.3"

version := "0.1.0"

parallelExecution := false

scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature", "-language:postfixOps")

publish := false

// mDialog dependencies
libraryDependencies ++= Seq(
  "com.mdialog" %% "smoke" % "1.0.1"
)

resolvers ++= Seq(
  "mDialog releases" at "http://mdialog.github.com/releases/"
)
