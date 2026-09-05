export class HttpError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
