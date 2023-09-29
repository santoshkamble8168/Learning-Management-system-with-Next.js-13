class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Ensure the error name is the same as the class name
    this.name = this.constructor.name;

    // Capture a stack trace for better error reporting
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;