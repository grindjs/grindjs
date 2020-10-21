import { HttpError } from './HttpError'

export class HttpClientError extends HttpError {}

export class BadRequestError extends HttpClientError {
	static representsCode = 400
}

export class UnauthorizedError extends HttpClientError {
	static representsCode = 401
}

export class PaymentRequiredError extends HttpClientError {
	static representsCode = 402
}

export class ForbiddenError extends HttpClientError {
	static representsCode = 403
}

export class NotFoundError extends HttpClientError {
	static representsCode = 404
}

export class MethodNotAllowedError extends HttpClientError {
	static representsCode = 405
}

export class NotAcceptableError extends HttpClientError {
	static representsCode = 406
}

export class ProxyAuthenticationRequiredError extends HttpClientError {
	static representsCode = 407
}

export class RequestTimeoutError extends HttpClientError {
	static representsCode = 408
}

export class ConflictError extends HttpClientError {
	static representsCode = 409
}

export class GoneError extends HttpClientError {
	static representsCode = 410
}

export class LengthRequiredError extends HttpClientError {
	static representsCode = 411
}

export class PreconditionFailedError extends HttpClientError {
	static representsCode = 412
}

export class PayloadTooLargeError extends HttpClientError {
	static representsCode = 413
}

export class URITooLongError extends HttpClientError {
	static representsCode = 414
}

export class UnsupportedMediaTypeError extends HttpClientError {
	static representsCode = 415
}

export class RangeNotSatisfiableError extends HttpClientError {
	static representsCode = 416
}

export class ExpectationFailedError extends HttpClientError {
	static representsCode = 417
}

export class ImATeapotError extends HttpClientError {
	static representsCode = 418
}

export class MisdirectedRequestError extends HttpClientError {
	static representsCode = 421
}

export class UnprocessableEntityError extends HttpClientError {
	static representsCode = 422
}

export class LockedError extends HttpClientError {
	static representsCode = 423
}

export class FailedDependencyError extends HttpClientError {
	static representsCode = 424
}

export class UnorderedCollectionError extends HttpClientError {
	static representsCode = 425
}

export class UpgradeRequiredError extends HttpClientError {
	static representsCode = 426
}

export class PreconditionRequiredError extends HttpClientError {
	static representsCode = 428
}

export class TooManyRequestsError extends HttpClientError {
	static representsCode = 429
}

export class RequestHeaderFieldsTooLargeError extends HttpClientError {
	static representsCode = 431
}

export class UnavailableForLegalReasonsError extends HttpClientError {
	static representsCode = 451
}
