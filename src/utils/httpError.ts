export class HttpError extends Error {
  constructor(public status: number, public message: string) {
    super(message); // Pass the message to the parent Error class
    this.name = "HttpError"; // Set a descriptive name for the error class
  }
}
