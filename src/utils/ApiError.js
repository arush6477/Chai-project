//Standardising the error api using the Error class that is provided by the nodejs itself

class ApiError extends Error{
    constructor (
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        } else{
            Error
            .captureStackTrace(this,this.constructor)
        }
    }
}