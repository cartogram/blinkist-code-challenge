


import {defineMiddleware} from "astro/middleware";

const experiments = [
  {
    paths: ["/blog"],
    name: "new-blog-headline-text",
    variation: ["A", "B"]
  },
  {
    paths: ["/blog"],
    name: "blog-signup-cta",
    variation: ["show", "hide"]
  }
]

export const onRequest = defineMiddleware(async (context, next) => {
  // pull the request and locals objects out of the context
  const {request, locals} = context

  // create an object to store the variations
  locals.variations = locals.variations || {}

  // parse the url so we can check the path
  const url = new URL(request.url)

  // check if we have an experiment that matches the current path
  const routeExperiments = experiments.filter((exp) => exp.paths.includes(url.pathname))

  if (routeExperiments.length === 0) {
    // no experiment on this route, continue to next middleware in the chain
    return next()
  }

  let response
  let cookiesToSet = []

  for (const experiment of routeExperiments) {
    // check if the user already has a cookie for this experiment (meaning they've already been assigned a variation)
    const cookie = request.headers.get("cookie")?.split(";").find((c) => c.trim().startsWith(experiment.name))

    if (!cookie) {
      // if there is no cookie, this is a new user and we need to a variation to send them to

      // pick a random variation using any algorithm you want
      const variation = experiment.variation[Math.floor(Math.random() * experiment.variation.length)]

      // set the variation on the locals object so we can access it in our page
      locals.variations[experiment.name] = variation

      // remember our cookie
      cookiesToSet.push(`${experiment.name}=${variation}`)
    } else {
      // if we get here, the user already has a cookie, so we can just use that variation
      const variation = cookie?.split("=")[1]

      // set the variation on the locals object so we can access it in our page
      locals.variations[experiment.name] = variation
    }
  }

  // render the page
  response = await next()

  // if we have cookies to set, add them to the response
  if (cookiesToSet.length > 0) {
    cookiesToSet.map((cookie) => {
      response.headers.append("Set-Cookie", cookie)
    })
  }

  // return the response to stop the middleware chain
  return response
})
