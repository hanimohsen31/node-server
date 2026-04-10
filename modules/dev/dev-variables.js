const helmetContentSecurityPolicy = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'",'unsafe-eval',"https://cdnjs.cloudflare.com","'unsafe-inline'",],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'","https://cdnjs.cloudflare.com","https://fonts.googleapis.com","'unsafe-inline'",],
        fontSrc: ["'self'","https://fonts.gstatic.com"],
        connectSrc: ["'self'","https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'","data:","https:"],
        objectSrc: ["'none'"]
    }
}

// USAGE in index.js
// helmet.contentSecurityPolicy({...helmetContentSecurityPolicy}),
